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
  // For a LOW zoom field, the legal range is inset by half the zoom window's
  // bandwidth, so the whole window - not just its centre point - stays within the band. The
  // exact legal-value constraint is still TBC; this is the only rule applied for now.
  // The inset is applied in Hz first (matching clampCentralFrequencyToWindowHz/stepCentralFrequencyHz's
  // own arithmetic) and the result rounded to 6 d.p. the same way commit()/step() round a
  // committed value - otherwise a value that's genuinely exactly at the boundary can differ from
  // min/max by a fraction of a Hz (from the separate Hz->units conversion, and from that rounding
  // never being applied here) and get wrongly flagged as out of range.
  const halfWindowHz = isLowZoom ? windowBandwidthHz / 2 : 0;
  const min = Number(frequencyConversion(minHz + halfWindowHz, FREQUENCY_HZ, units).toFixed(6));
  const max = Number(frequencyConversion(maxHz - halfWindowHz, FREQUENCY_HZ, units).toFixed(6));

  const validateStep = (cf: number): string => {
    if (cf < min || cf > max) return t(FIELD + '.error.range');
    const cfHz = frequencyConversion(cf, units, FREQUENCY_HZ);
    if (!isCentralFrequencyOnChannelGrid(cfHz, channelWidthHz, windowBandwidthHz, minHz)) {
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
  const minFreq = frequencyConversion(band?.minFrequencyHz ?? 0, FREQUENCY_HZ, units);
  const maxFreq = frequencyConversion(band?.maxFrequencyHz ?? 0, FREQUENCY_HZ, units);
  const coarseChannelWidthHz = osdLOW?.basicCapabilities.coarseChannelWidthHz ?? 1;
  const channelWidthMHz = frequencyConversion(coarseChannelWidthHz, FREQUENCY_HZ, FREQUENCY_MHZ);
  const stepMHz = channelWidthMHz * 2;

  const validate = (cfValue: number): string => {
    if (cfValue < minFreq || cfValue > maxFreq) return t(FIELD + '.error.range');
    if (
      isLow &&
      !isCentralFrequencyDivisible(
        frequencyConversion(cfValue, units, FREQUENCY_HZ),
        coarseChannelWidthHz
      )
    ) {
      return t(FIELD + '.error.divisibility', { value: stepMHz });
    }
    return '';
  };

  // A valid central frequency sits at a half-channel offset from absolute 0 Hz (so the SPW's
  // first coarse channel is even) - see validate()'s divisibility check above, which enforces
  // the same rule. minFreq is itself a half-channel-inset value (not a whole-channel multiple),
  // so snapping relative to minFreq instead of 0 would land on the wrong grid entirely.
  const snapToValidGrid = (currentValue: number) =>
    (Math.round(currentValue / channelWidthMHz - 0.5) + 0.5) * channelWidthMHz;

  const checkValue = (cfValue: number) => {
    setValue(cfValue);
    setErrorMessage(validate(cfValue));
  };

  // Steps by one coarse-channel-grid unit (LOW) or a plain 1-unit increment (MID, which has no
  // channel-grid constraint), snapping to the grid first if not already aligned.
  // Stepping by a full stepMHz (2 channels) preserves the grid's alf-channel-offset parity.
  const stepChannel = (currentValue: number, direction: 1 | -1): number => {
    const stepped = isLow
      ? snapToValidGrid(currentValue) + direction * stepMHz
      : currentValue + direction;
    return clampAndRound(stepped, minAllowedFrequency, maxAllowedFrequency);
  };

  // The legal centre-frequency range must keep the *whole* configured continuum bandwidth inside
  // the band, so it's inset by half of the actual bandwidth - not a fixed minimum-bandwidth
  // assumption (which only leaves room for the smallest possible bandwidth, letting a much wider
  // real bandwidth spill past the band edge). Falls back to the old minimum-bandwidth inset only
  // if the caller hasn't got a real bandwidth to pass yet.
  const fallbackBandwidthHz = osdLOW?.basicCapabilities.coarseChannelWidthHz
    ? osdLOW.basicCapabilities.coarseChannelWidthHz * LOW_COARSE_CHANNELS_PER_BANDWIDTH_STEP
    : // TODO: Mid values should come from OSD in the future - 13440 is Mid channel width in Hz
      //  and until AA2 bandwidth has to be multiple of 20 channels.
      Math.round(20 * 13440 * 1e12) / 1e12;
  const halfBandwidthMHz =
    frequencyConversion(continuumBandwidthHz || fallbackBandwidthHz, FREQUENCY_HZ, FREQUENCY_MHZ) /
    2;
  const minAllowedFrequency = halfBandwidthMHz + minFreq;
  const maxAllowedFrequency = maxFreq - halfBandwidthMHz;

  // validateStep/validate close over values (e.g. the mocked `t` in tests) that can get a new
  // identity on every render without the underlying validity actually changing. Reading them via
  // a ref - updated on every render, but not itself a dependency - keeps the effect below from
  // re-running (and clobbering an error just set by onCommit) unless value/isLowZoom truly change.
  const validateStepRef = React.useRef(validateStep);
  validateStepRef.current = validateStep;
  const validateRef = React.useRef(validate);
  validateRef.current = validate;

  // Validates the current value whenever it changes for any reason - not just a user edit via
  // onCommit - e.g. on mount with a value loaded from a saved observation, or once async OSD
  // band/channel data arrives late. The value itself is never touched here, only the warning.
  React.useEffect(() => {
    setErrorMessage(isLowZoom ? validateStepRef.current(value) : validateRef.current(value));
  }, [value, isLowZoom]);

  // Native <input type="number"> min/max/step attributes - purely a browser-level hint (for the
  // native spinner and keyboard input restrictions). The actual snap-to-grid stepping always goes
  // through onStep, which SteppedNumberField calls directly on ArrowUp/ArrowDown.
  const nativeMin = isLowZoom ? min : minAllowedFrequency;
  const nativeMax = isLowZoom ? max : maxAllowedFrequency;
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
      onCommit={isLowZoom ? commit : checkValue}
      onStep={isLowZoom ? stepWindowBandwidth : stepChannel}
      onFocus={() => setHelp(FIELD)}
      disabled={disabled}
      required={required}
      errorText={errorMessage}
      suffix={suffix}
      min={nativeMin}
      max={nativeMax}
      step={nativeStep}
    />
  );
}
