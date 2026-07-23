import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import {
  BAND_LOW_STR,
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
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

interface CentralFrequencyProps {
  channelWidthHz?: number;
  disabled?: boolean;
  required?: boolean;
  observingBand: string;
  setValue: Function;
  isLowZoom?: boolean;
  suffix?: any;
  value: number;
  bandwidthHz: number;
}

export default function CentralFrequency({
  channelWidthHz = 0,
  disabled = false,
  observingBand,
  required = false,
  setValue,
  isLowZoom = false,
  suffix,
  value,
  bandwidthHz
}: CentralFrequencyProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'centralFrequency';
  const { findBand, telescopeBand } = useOSDAccessors();
  const isLow = observingBand === BAND_LOW_STR;
  const units: number =
    telescopeBand(observingBand) === TELESCOPE_LOW_NUM ? FREQUENCY_MHZ : FREQUENCY_GHZ;
  const band = findBand(observingBand);

  // ----  LOW zoom mode: window-clamped channel-grid validation ----
  const [errorMessage, setErrorMessage] = React.useState('');

  // Need to still round for clean display otherwise could be a few kHz off.
  // Perhaps could be done either at source or  in the frequencyConversion function but that would be a breaking change.
  const minHz = band?.minFrequencyHz ?? 0;
  const maxHz = band?.maxFrequencyHz ?? 0;
  // For a LOW zoom field, the legal range is inset by half the zoom window's
  // bandwidth, so the whole window - not just its centre point - stays within the band. The
  // exact legal-value constraint is still TBC; this is the only rule applied for now.
  const halfWindowUnits = bandwidthHz / 2;
  const minAllowedFrequency = frequencyConversion(minHz + halfWindowUnits, FREQUENCY_HZ, units);
  const maxAllowedFrequency = frequencyConversion(maxHz - halfWindowUnits, FREQUENCY_HZ, units);

  const validate = (cf: number): string => {
    if (cf < minAllowedFrequency || cf > maxAllowedFrequency) return t(FIELD + '.error.range');
    const cfHz = frequencyConversion(cf, units, FREQUENCY_HZ);
    if (!isCentralFrequencyOnChannelGrid(cfHz, channelWidthHz, bandwidthHz, band?.minFrequencyHz ?? 0) || !isCentralFrequencyDivisible(
        frequencyConversion(cf, units, FREQUENCY_HZ),
        channelWidthHz
      )) {
      return t(FIELD + '.error.divisibility');
    }
    return '';
  };

  // Always accepts the typed value and flags an error if invalid, rather than silently
  // rejecting/reverting it.
  const commit = (cf: number) => {
    setValue(cf);
    setErrorMessage(validate(cf));
  };

  const step = (currentValue: number, direction: 1 | -1) => {
    const cfHz = frequencyConversion(currentValue, units, FREQUENCY_HZ);
    const steppedHz = stepCentralFrequencyHz(
      cfHz,
      direction,
      channelWidthHz,
      bandwidthHz,
      minHz,
      maxHz
    );
    // Round to 1 Hz precision (6 d.p. in MHz) to avoid floating-point noise building up
    // across repeated arrow presses.
    return Number(frequencyConversion(steppedHz, FREQUENCY_HZ, units).toFixed(6));
  };

  // ---- Continuum/MID mode: coarse-channel-grid divisibility validation ----
  const channelWidthMHz = frequencyConversion(channelWidthHz ?? 1, FREQUENCY_HZ, FREQUENCY_MHZ);
  const stepMHz = channelWidthMHz * 2;

  // A valid central frequency sits at a half-channel offset from absolute 0 Hz (so the SPW's
  // first coarse channel is even) - see validate()'s divisibility check above, which enforces
  // the same rule. minFreq is itself a whole-channel multiple (not a half-channel offset), so
  // snapping relative to minFreq instead of 0 would land on the wrong grid entirely.
  const snapToValidGrid = (currentValue: number) =>
    (Math.round(currentValue / channelWidthMHz - 0.5) + 0.5) * channelWidthMHz;

  // Steps by one coarse-channel-grid unit (LOW) or a plain 1-unit increment (MID, which has no
  // channel-grid constraint), snapping to the grid first if not already aligned.
  // Stepping by a full stepMHz (2 channels) preserves the grid's alf-channel-offset parity.
  const stepNonSteppable = (currentValue: number, direction: 1 | -1): number => {
    const stepped = isLow
      ? snapToValidGrid(currentValue) + direction * stepMHz
      : currentValue + direction;
    return Number(Math.min(maxAllowedFrequency, Math.max(minAllowedFrequency, stepped)).toFixed(6));
  };

  // validate close over values (e.g. the mocked `t` in tests) that can get a new
  // identity on every render without the underlying validity actually changing. Reading them via
  // a ref - updated on every render, but not itself a dependency - keeps the effect below from
  // re-running (and clobbering an error just set by onCommit) unless value/isLowZoom truly change.
  const validateRef = React.useRef(validate);
  validateRef.current = validate;

  // Validates the current value whenever it changes for any reason - not just a user edit via
  // onCommit - e.g. on mount with a value loaded from a saved observation, or once async OSD
  // band/channel data arrives late. The value itself is never touched here, only the warning.
  React.useEffect(() => {
    setErrorMessage(validateRef.current(value));
  }, [value]);

  // Native <input type="number"> min/max/step attributes - purely a browser-level hint (for the
  // native spinner and keyboard input restrictions). The actual snap-to-grid stepping always goes
  // through onStep, which SteppedNumberField calls directly on ArrowUp/ArrowDown.
  const nativeStep = isLow
      ? frequencyConversion( isLowZoom ? channelWidthHz : channelWidthHz * 2 || 1, FREQUENCY_HZ, units)
      : 1;

  return (
    <SteppedNumberField
      testId={FIELD}
      label={t(FIELD + '.label')}
      value={value}
      onCommit={commit}
      onStep={isLowZoom ? step : stepNonSteppable}
      onFocus={() => setHelp(FIELD)}
      disabled={disabled}
      required={required}
      errorText={errorMessage}
      suffix={suffix}
      min={minAllowedFrequency}
      max={maxAllowedFrequency}
      step={nativeStep}
    />
  );
}
