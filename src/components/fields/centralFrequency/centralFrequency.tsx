import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { FREQUENCY_GHZ, FREQUENCY_HZ, FREQUENCY_MHZ, TELESCOPE_LOW_NUM } from '@/utils/constants';
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
  const [fieldValid, setFieldValid] = React.useState(true);
  const { findBand, telescopeBand } = useOSDAccessors();
  const [cfValue, setCfValue] = React.useState<string>(value != null ? String(value) : '');

  React.useEffect(() => {
    setCfValue(value != null ? String(value) : '');
    setFieldValid(true);
  }, [value]);

  const units: number =
    telescopeBand(observingBand) === TELESCOPE_LOW_NUM ? FREQUENCY_MHZ : FREQUENCY_GHZ;
  const band = findBand(observingBand);
  const minHz = band?.minFrequencyHz ?? 0;
  const maxHz = band?.maxFrequencyHz ?? 0;
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

  const checkValue = (raw: string) => {
    setCfValue(raw);
    if (raw === '' || isNaN(Number(raw))) {
      setFieldValid(false);
    } else {
      commit(Number(raw));
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

  const errorMessage = fieldValid ? '' : t(FIELD + '.range.error');

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
        errorText={errorMessage}
        suffix={suffix}
      />
    );
  }

  return (
    <NumberEntry
      disabled={disabled}
      label={t(FIELD + '.label')}
      testId={FIELD}
      value={cfValue}
      setValue={checkValue}
      onFocus={() => setHelp(FIELD)}
      required={required}
      suffix={suffix}
      errorText={errorMessage}
    />
  );
}
