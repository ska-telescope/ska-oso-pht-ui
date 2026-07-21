import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import {
  BAND_LOW_STR,
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  LOW_COARSE_CHANNELS_PER_BANDWIDTH_STEP,
  TELESCOPE_LOW_NUM
} from '@/utils/constants';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { frequencyConversion } from '@/utils/helpers';
import { stepCentralFrequencyHz } from '@/utils/zoomWindow';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';

interface CentralFrequencyProps {
  channelWidthHz?: number;
  coarseChannelMaxHz?: number;
  coarseChannelMinHz?: number;
  disabled?: boolean;
  required?: boolean;
  observingBand: string;
  setValue: Function;
  steppable?: boolean;
  suffix?: any;
  value: number;
  windowBandwidthHz?: number;
}

export default function CentralFrequency({
  channelWidthHz = 0,
  coarseChannelMaxHz,
  coarseChannelMinHz,
  disabled = false,
  observingBand,
  required = false,
  setValue,
  steppable = false,
  suffix,
  value,
  windowBandwidthHz = 0
}: CentralFrequencyProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'centralFrequency';
  const { findBand, telescopeBand, osdLOW } = useOSDAccessors();
  const isLow = observingBand === BAND_LOW_STR;
  const units: number =
    telescopeBand(observingBand) === TELESCOPE_LOW_NUM ? FREQUENCY_MHZ : FREQUENCY_GHZ;
  const band = findBand(observingBand);

  // ---- Steppable (LOW zoom) mode: window-clamped channel-grid validation ----
  const [errorMessage, setErrorMessage] = React.useState('');

  // The legal range is the intersection of the band's own edges and the (usually tighter)
  // coarse-channel-derived range, when the latter is available.
  const minHz = Math.max(band?.minFrequencyHz ?? 0, coarseChannelMinHz ?? -Infinity);
  const maxHz = Math.min(band?.maxFrequencyHz ?? 0, coarseChannelMaxHz ?? Infinity);
  // For a steppable (LOW zoom) field, the legal range is inset by half the zoom window's
  // bandwidth, so the whole window - not just its centre point - stays within the band. The
  // exact legal-value constraint is still TBC; this is the only rule applied for now.
  const halfWindowUnits = steppable
    ? frequencyConversion(windowBandwidthHz, FREQUENCY_HZ, units) / 2
    : 0;
  const min = frequencyConversion(minHz, FREQUENCY_HZ, units) + halfWindowUnits;
  const max = frequencyConversion(maxHz, FREQUENCY_HZ, units) - halfWindowUnits;

  // A valid central frequency has the zoom window's start channel land on a whole number of
  // channels from the band's minimum frequency (see snapCentralFrequencyToChannelGridHz, which
  // this mirrors as a check rather than a correction). Tolerance is in Hz, not a fraction of a
  // channel - values round-trip through a 6-d.p. MHz display, which alone can introduce ~0.5 Hz
  // of noise, easily dwarfing a fixed fractional-channel tolerance when channelWidthHz is small.
  const isOnChannelGrid = (cf: number): boolean => {
    if (channelWidthHz <= 0) return true;
    const cfHz = frequencyConversion(cf, units, FREQUENCY_HZ);
    const numberOfChannels = windowBandwidthHz / channelWidthHz;
    const startChannel = Math.round((cfHz - minHz) / channelWidthHz - numberOfChannels / 2);
    const gridHz = minHz + (startChannel + numberOfChannels / 2) * channelWidthHz;
    return Math.abs(cfHz - gridHz) < 1;
  };

  const validateStep = (cf: number): string => {
    if (cf < min || cf > max) return t(FIELD + '.error.range');
    if (!isOnChannelGrid(cf)) return t(FIELD + '.error.divisibility');
    return '';
  };

  // Always accepts the typed value and flags an error if invalid, rather than silently
  // rejecting/reverting it - matching how the non-steppable path's checkValue behaves below.
  const commit = (cf: number) => {
    setValue(cf);
    setErrorMessage(validateStep(cf));
  };

  const step = (currentValue: number, direction: 1 | -1) => {
    const cfHz = frequencyConversion(currentValue, units, FREQUENCY_HZ);
    const steppedHz = stepCentralFrequencyHz(
      cfHz,
      direction,
      channelWidthHz,
      windowBandwidthHz,
      minHz,
      maxHz
    );
    // Round to 1 Hz precision (6 d.p. in MHz) to avoid floating-point noise building up
    // across repeated arrow presses.
    return Number(frequencyConversion(steppedHz, FREQUENCY_HZ, units).toFixed(6));
  };

  // ---- Non-steppable (continuum/MID) mode: coarse-channel-grid divisibility validation ----
  const minFreq = frequencyConversion(band?.minFrequencyHz ?? 0, FREQUENCY_HZ, units);
  const maxFreq = frequencyConversion(band?.maxFrequencyHz ?? 0, FREQUENCY_HZ, units);
  const channelWidthMHz = frequencyConversion(
    osdLOW?.basicCapabilities.coarseChannelWidthHz ?? 1,
    FREQUENCY_HZ,
    FREQUENCY_MHZ
  );
  const stepMHz = channelWidthMHz * 2;

  const validate = (cfValue: number): string => {
    if (cfValue < minFreq || cfValue > maxFreq) return t(FIELD + '.error.range');
    if (isLow && !Number.isInteger((cfValue + 0.5 * channelWidthMHz) / channelWidthMHz)) {
      return t(FIELD + '.error.divisibility', { value: stepMHz });
    }
    return '';
  };

  // A valid central frequency sits at a half-channel offset from absolute 0 Hz (so the SPW's
  // first coarse channel is even) - see validate()'s divisibility check above, which enforces
  // the same rule. minFreq is itself a whole-channel multiple (not a half-channel offset), so
  // snapping relative to minFreq instead of 0 would land on the wrong grid entirely.
  const snapToValidGrid = (currentValue: number) =>
    (Math.round(currentValue / channelWidthMHz - 0.5) + 0.5) * channelWidthMHz;

  const checkValue = (cfValue: number) => {
    setValue(cfValue);
    setErrorMessage(validate(cfValue));
  };

  // Steps by one coarse-channel-grid unit (LOW) or a plain 1-unit increment (MID, which has no
  // channel-grid constraint), snapping to the grid first if not already aligned - same principle
  // as the steppable path's onStep. Stepping by a full stepMHz (2 channels) preserves the grid's
  // half-channel-offset parity.
  const stepNonSteppable = (currentValue: number, direction: 1 | -1): number => {
    const stepped = isLow
      ? snapToValidGrid(currentValue) + direction * stepMHz
      : currentValue + direction;
    return Number(Math.min(maxAllowedFrequency, Math.max(minAllowedFrequency, stepped)).toFixed(6));
  };

  // The minimum frequency the input should allow should be the minimum valid frequency - this is
  // not the actual minimum frequency but minFreq + minBandwidth / 2
  const halfBandwidthMHz =
    frequencyConversion(
      osdLOW?.basicCapabilities.coarseChannelWidthHz * LOW_COARSE_CHANNELS_PER_BANDWIDTH_STEP ??
        // TODO: Mid values should come from OSD in the future - 13440 is Mid channel width in Hz
        //  and until AA2 bandwidth has to be multiple of 20 channels.
        Math.round(20 * 13440 * 1e12) / 1e12,
      FREQUENCY_HZ,
      FREQUENCY_MHZ
    ) / 2;
  const minAllowedFrequency = halfBandwidthMHz + minFreq;
  const maxAllowedFrequency = maxFreq - halfBandwidthMHz;

  return (
    <SteppedNumberField
      testId={FIELD}
      label={t(FIELD + '.label')}
      value={value}
      onCommit={steppable ? commit : checkValue}
      onStep={steppable ? step : stepNonSteppable}
      onFocus={() => setHelp(FIELD)}
      disabled={disabled}
      required={required}
      errorText={errorMessage}
      suffix={suffix}
    />
  );
}
