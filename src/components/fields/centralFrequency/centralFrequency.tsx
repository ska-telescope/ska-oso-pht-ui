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
import {
  isCentralFrequencyDivisible,
  isCentralFrequencyOnChannelGrid,
  stepCentralFrequencyHz
} from '@/utils/zoomWindow';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';
import { isInteger } from 'lodash';

const clampAndRound = (value: number, min: number, max: number): number =>
  Number(Math.min(max, Math.max(min, value)).toFixed(6));

interface CentralFrequencyProps {
  channelWidthHz?: number;
  continuumBandwidthHz?: number;
  disabled?: boolean;
  required?: boolean;
  observingBand: string;
  setValue: Function;
  isLowZoom?: boolean;
  suffix?: any;
  value: number;
  windowBandwidthHz?: number;
}

export default function CentralFrequency({
  channelWidthHz = 0,
  continuumBandwidthHz = 0,
  disabled = false,
  observingBand,
  required = false,
  setValue,
  isLowZoom = false,
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

  // ----  LOW zoom mode: window-clamped channel-grid validation ----
  const [errorMessage, setErrorMessage] = React.useState('');

  // band is osdLOW.basicCapabilities itself for LOW (see findBand in useOSDAccessors), which
  // already carries the coarse-channel-derived edges (see getOSDCycles.tsx) - no need to
  // recompute them from minCoarseChannel/maxCoarseChannel/coarseChannelWidthHz here too.
  const minHz = band?.minFrequencyHz ?? 0;
  const maxHz = band?.maxFrequencyHz ?? 0;
  // The legal range is inset by half the bandwidth, so the whole window - not just its centre
  // point - stays within the band. The exact legal-value constraint is still TBC; this is the only
  // rule applied for now. The inset is applied in Hz first (matching clampCentralFrequencyToWindowHz/stepCentralFrequencyHz's
  // own arithmetic) and the result rounded to 6 d.p. the same way commit()/step() round a
  // committed value - otherwise a value that's genuinely exactly at the boundary can differ from
  // min/max by a fraction of a Hz (from the separate Hz->units conversion, and from that rounding
  // never being applied here) and get wrongly flagged as out of range.
  // continuumBandwidthHz can be legitimately 0 for a moment (e.g. the caller's own default hasn't
  // resolved yet because it depends on OSD data that's still loading) - falling back to a fixed
  // minimum-bandwidth inset in that case avoids a 0 Hz inset, which would let the real (usually
  // much wider) bandwidth spill straight past the band edge once it does resolve.
  const fallbackBandwidthHz = osdLOW?.basicCapabilities.coarseChannelWidthHz
    ? osdLOW.basicCapabilities.coarseChannelWidthHz * LOW_COARSE_CHANNELS_PER_BANDWIDTH_STEP
    : // TODO: Mid values should come from OSD in the future - 13440 is Mid channel width in Hz
      //  and until AA2 bandwidth has to be multiple of 20 channels.
      Math.round(20 * 13440 * 1e12) / 1e12;
  const halfWindowHz =
    (isLowZoom ? windowBandwidthHz : continuumBandwidthHz || fallbackBandwidthHz) / 2;
  const min = Number(frequencyConversion(minHz + halfWindowHz, FREQUENCY_HZ, units).toFixed(6));
  const max = Number(frequencyConversion(maxHz - halfWindowHz, FREQUENCY_HZ, units).toFixed(6));

  const validateStep = (cf: number): string => {
    if (cf < min || cf > max) return t(FIELD + '.error.range');
    const cfHz = frequencyConversion(cf, units, FREQUENCY_HZ);
    if (
      isLowZoom
        ? !isCentralFrequencyOnChannelGrid(cfHz, channelWidthHz, windowBandwidthHz, minHz)
        : !isCentralFrequencyDivisible(
            frequencyConversion(cf, units, FREQUENCY_HZ),
            coarseChannelWidthHz
          )
    ) {
      return t(FIELD + '.error.divisibility');
    }
    return '';
  };

  // Always accepts the typed value and flags an error if invalid, rather than silently
  // rejecting/reverting it.
  const commit = (cf: number) => {
    setValue(cf);
    setErrorMessage(validateStep(cf));
  };

  const stepWindowBandwidth = (currentValue: number, direction: 1 | -1) => {
    const cfHz = frequencyConversion(currentValue, units, FREQUENCY_HZ);
    const steppedHz = stepCentralFrequencyHz(
      cfHz,
      direction,
      channelWidthHz,
      windowBandwidthHz,
      minHz,
      maxHz
    );
    return clampAndRound(frequencyConversion(steppedHz, FREQUENCY_HZ, units), min, max);
  };

  // ---- Continuum/MID mode: coarse-channel-grid divisibility validation ----
  const coarseChannelWidthHz = osdLOW?.basicCapabilities.coarseChannelWidthHz ?? 1;
  const channelWidthMHz = frequencyConversion(coarseChannelWidthHz, FREQUENCY_HZ, FREQUENCY_MHZ);
  const stepMHz = channelWidthMHz * 2;

  // Directional variants used only to correct a clamped-to-boundary value back onto the grid
  // (see stepChannel below) - rounding towards the interior of [min, max] rather than to the
  // nearest grid point, so the correction can never overshoot back past the boundary it came from.
  const snapToValidGridFloor = (currentValue: number) =>
    (Math.floor(currentValue / channelWidthMHz - 0.5 + 1e-9) + 0.5) * channelWidthMHz;
  const snapToValidGridCeil = (currentValue: number) =>
    (Math.ceil(currentValue / channelWidthMHz - 0.5 - 1e-9) + 0.5) * channelWidthMHz;

  // Steps by one coarse-channel-grid unit (LOW) or a plain 1-unit increment (MID, which has no
  // channel-grid constraint), snapping to the grid first if not already aligned.
  // Stepping by a full stepMHz (2 channels) preserves the grid's alf-channel-offset parity.
  const stepChannel = (currentValue: number, direction: 1 | -1): number => {
    if (direction == -1 && currentValue > max) return max;
    if (direction == 1 && currentValue < min) return min;
    const channelNumber = (currentValue + 0.5 * channelWidthMHz) / channelWidthMHz;
    if (isLow ? channelNumber % 2 === 0 : isInteger(channelNumber)) {
      return isLow ? currentValue + direction * stepMHz : currentValue + direction * stepMHz;
    } else {
      return direction === -1
        ? snapToValidGridFloor(currentValue)
        : snapToValidGridCeil(currentValue);
    }
  };

  // validateStep/validate close over values (e.g. the mocked `t` in tests) that can get a new
  // identity on every render without the underlying validity actually changing. Reading them via
  // a ref - updated on every render, but not itself a dependency - keeps the effect below from
  // re-running (and clobbering an error just set by onCommit) unless value/isLowZoom truly change.
  const validateStepRef = React.useRef(validateStep);
  validateStepRef.current = validateStep;

  // Validates the current value whenever it changes for any reason - not just a user edit via
  // onCommit - e.g. on mount with a value loaded from a saved observation, or once async OSD
  // band/channel data arrives late. Also re-runs when min/max shift under an unchanged value -
  // e.g. continuumBandwidthHz moving from its loading fallback to the resolved real bandwidth -
  // so a value that becomes invalid under the new bounds is flagged without needing a fresh edit.
  // coarseChannelWidthHz is listed separately from min/max because it can change on its own -
  // it's a standalone OSD field, not derived from the band edges that produce min/max - so a
  // width-only OSD update wouldn't otherwise re-run this check.
  // The value itself is never touched here, only the warning.
  React.useEffect(() => {
    setErrorMessage(validateStepRef.current(value));
  }, [value, min, max, coarseChannelWidthHz]);

  // Native <input type="number"> step attributes - purely a browser-level hint (for the
  // native spinner and keyboard input restrictions). The actual snap-to-grid stepping always goes
  // through onStep, which SteppedNumberField calls directly on ArrowUp/ArrowDown.
  const nativeStep = isLowZoom
    ? frequencyConversion(channelWidthHz || 1, FREQUENCY_HZ, units)
    : isLow
      ? stepMHz
      : 1;

  return (
    <SteppedNumberField
      testId={FIELD}
      label={t(FIELD + '.label')}
      value={value}
      onStep={isLowZoom ? stepWindowBandwidth : stepChannel}
      onCommit={commit}
      onFocus={() => setHelp(FIELD)}
      disabled={disabled}
      required={required}
      errorText={errorMessage}
      requiredText={t(FIELD + '.error.required')}
      suffix={suffix}
      min={min}
      max={max}
      step={nativeStep}
    />
  );
}
