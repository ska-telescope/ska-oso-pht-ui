import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
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
  clampCentralFrequencyToWindowHz,
  snapCentralFrequencyToChannelGridHz,
  stepCentralFrequencyHz
} from '@/utils/zoomWindow';
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

  // ---- Steppable (LOW zoom) mode: SteppedNumberField + channel-grid snap ----
  const [fieldValid, setFieldValid] = React.useState(true);

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

  const commit = (cf: number) => {
    const inRange = cf >= min && cf <= max;
    setFieldValid(inRange);
    if (inRange) {
      setValue(cf);
    }
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

  const stepErrorMessage = fieldValid ? '' : t(FIELD + '.range.error');

  // On losing focus, snap to the nearest central frequency whose start channel is a whole
  // number of channels from the band's minimum frequency.
  const snapToChannelGrid = (currentValue: number) => {
    const cfHz = frequencyConversion(currentValue, units, FREQUENCY_HZ);
    const numberOfChannels = channelWidthHz > 0 ? windowBandwidthHz / channelWidthHz : 0;
    const snappedHz = snapCentralFrequencyToChannelGridHz(
      cfHz,
      channelWidthHz,
      numberOfChannels,
      minHz
    );
    const clampedHz = clampCentralFrequencyToWindowHz(snappedHz, windowBandwidthHz, minHz, maxHz);
    commit(Number(frequencyConversion(clampedHz, FREQUENCY_HZ, units).toFixed(6)));
  };

  // ---- Non-steppable (continuum/MID) mode: native TextField + divisibility validation ----
  const [errorMessage, setErrorMessage] = React.useState('');
  const minFreq = frequencyConversion(band?.minFrequencyHz ?? 0, FREQUENCY_HZ, units);
  const maxFreq = frequencyConversion(band?.maxFrequencyHz ?? 0, FREQUENCY_HZ, units);
  const stepMHz = frequencyConversion(
    (osdLOW?.basicCapabilities.coarseChannelWidthHz ?? 1) * 2,
    FREQUENCY_HZ,
    FREQUENCY_MHZ
  );

  const validate = (cfValue: number): string => {
    const lowStationChannelWidthMHz = frequencyConversion(
      osdLOW?.basicCapabilities.coarseChannelWidthHz,
      FREQUENCY_HZ,
      FREQUENCY_MHZ
    );
    if (cfValue < minFreq || cfValue > maxFreq) return t(FIELD + '.error.range');
    if (
      isLow &&
      !Number.isInteger((cfValue + 0.5 * lowStationChannelWidthMHz) / lowStationChannelWidthMHz)
    ) {
      return t(FIELD + '.error.divisibility', { value: stepMHz });
    }
    return '';
  };

  // Snapping on every keystroke would corrupt mid-typing values (e.g. typing "180" one
  // character at a time), so onChange just accepts the raw value - snapping happens once,
  // on blur, via snapToStepGrid below.
  const checkValue = (cfValue: number) => {
    setValue(cfValue);
    setErrorMessage(validate(cfValue));
  };

  const snapToStepGrid = () => {
    if (!isLow) return;
    const snapped = minFreq + Math.round((value - minFreq) / stepMHz) * stepMHz;
    setValue(snapped);
    setErrorMessage(validate(snapped));
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

  if (steppable) {
    return (
      <SteppedNumberField
        testId={FIELD}
        label={t(FIELD + '.label')}
        value={value}
        onCommit={commit}
        onStep={step}
        onBlurCommit={snapToChannelGrid}
        onFocus={() => setHelp(FIELD)}
        disabled={disabled}
        required={required}
        errorText={stepErrorMessage}
        suffix={suffix}
      />
    );
  }

  return (
    <TextField
      type="number"
      variant="standard"
      fullWidth
      required={required}
      disabled={disabled}
      label={t(FIELD + '.label')}
      value={value}
      onChange={(e) => checkValue(Number(e.target.value))}
      onBlur={snapToStepGrid}
      error={!!errorMessage}
      helperText={errorMessage}
      onFocus={() => setHelp(FIELD)}
      slotProps={{
        htmlInput: {
          'data-testid': FIELD,
          step: isLow ? stepMHz : 1,
          min: minAllowedFrequency,
          max: maxAllowedFrequency
        },
        input: suffix
          ? { endAdornment: <InputAdornment position="end">{suffix}</InputAdornment> }
          : undefined
      }}
    />
  );
}
