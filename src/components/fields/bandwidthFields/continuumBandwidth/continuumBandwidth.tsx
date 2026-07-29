import {
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  LOW_COARSE_CHANNELS_PER_BANDWIDTH_STEP,
  TELESCOPE_LOW_NUM
} from '@utils/constants.ts';
import { frequencyConversion, getScaledBandwidthOrFrequency } from '@utils/helpers.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import React from 'react';
import {
  getMaxContBandwidthHz,
  checkMinimumChannelWidth,
  checkMaxBandwidthHz,
  checkBandLimits
} from '../bandwidthValidationCommon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import SteppedNumberField from '@components/wrappers/steppedNumberField/SteppedNumberField.tsx';

interface ContinuumBandwidthFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  setValue?: (v: number) => void;
  value: number;
  suffix?: any;
  telescope: number;
  observingBand?: string;
  continuumBandwidthUnits?: number;
  centralFrequency?: number;
  centralFrequencyUnits?: number;
  subarrayConfig?: string;
  minimumChannelWidthHz: number;
}

export default function ContinuumBandwidthField({
  disabled = false,
  setValue,
  value,
  suffix,
  telescope,
  observingBand,
  continuumBandwidthUnits,
  centralFrequency,
  centralFrequencyUnits,
  subarrayConfig,
  minimumChannelWidthHz
}: ContinuumBandwidthFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'continuumBandwidth';
  const { findBand, osdMID, osdLOW, observatoryConstants } = useOSDAccessors();
  const [errorText, setErrorText] = React.useState('');

  const displayMinimumChannelWidthErrorMessage = (): string => {
    const minimumChannelWidthMHz = frequencyConversion(
      minimumChannelWidthHz,
      FREQUENCY_HZ,
      FREQUENCY_MHZ
    ).toFixed(2);
    return t('bandwidth.range.minimumChannelWidthError', {
      value: minimumChannelWidthMHz
    });
  };

  const maxContBandwidthHz: number | undefined = getMaxContBandwidthHz(
    Number(telescope),
    observingBand ?? '',
    subarrayConfig ?? '',
    osdMID,
    osdLOW
  );
  const maxContBandwidthMHz = maxContBandwidthHz
    ? frequencyConversion(maxContBandwidthHz, FREQUENCY_HZ, FREQUENCY_MHZ)
    : undefined;

  const displayMaxContBandwidthErrorMessage = (): string => {
    const maxContBandwidthMHz = frequencyConversion(
      maxContBandwidthHz,
      FREQUENCY_HZ,
      FREQUENCY_MHZ
    ).toFixed(2);
    return t('bandwidth.range.contMaximumExceededError', { value: maxContBandwidthMHz });
  };

  const displayDivisibilityErrorMessage = (): string => {
    const valueMHz = frequencyConversion(
      minimumChannelWidthHz,
      FREQUENCY_HZ,
      FREQUENCY_MHZ
    ).toFixed(2);
    return t('continuumBandwidth.range.divisibilityError', { value: valueMHz });
  };

  const stepInUnits =
    minimumChannelWidthHz && continuumBandwidthUnits
      ? frequencyConversion(minimumChannelWidthHz, FREQUENCY_HZ, continuumBandwidthUnits)
      : 0;

  const validateValue = (num: number) => {
    const scaledBandwidth = getScaledBandwidthOrFrequency(num, continuumBandwidthUnits ?? 0);
    const scaledFrequency = getScaledBandwidthOrFrequency(centralFrequency, centralFrequencyUnits);

    const invalidMinChannel = !checkMinimumChannelWidth(
      Number(minimumChannelWidthHz),
      scaledBandwidth
    );
    const invalidMaxBandwidth = !checkMaxBandwidthHz(maxContBandwidthHz, scaledBandwidth);
    const invalidBandLimits = !checkBandLimits(
      scaledBandwidth,
      scaledFrequency,
      Number(telescope),
      subarrayConfig ?? '',
      observingBand ?? '',
      osdMID,
      osdLOW,
      observatoryConstants,
      findBand
    );

    if (invalidMinChannel) {
      return displayMinimumChannelWidthErrorMessage();
    }
    if (invalidMaxBandwidth) {
      return displayMaxContBandwidthErrorMessage();
    }
    if (invalidBandLimits) {
      return t('bandwidth.range.rangeError');
    }
    if (minimumChannelWidthHz && minimumChannelWidthHz > 0) {
      const remainder = Math.abs(scaledBandwidth % minimumChannelWidthHz);
      if (remainder > 1e-9 && Math.abs(remainder - minimumChannelWidthHz) > 1e-9)
        return displayDivisibilityErrorMessage();
    }
    return '';
  };

  const setValueAndValidate = (newValue: number) => {
    setErrorText(validateValue(newValue));
    setValue?.(newValue);
  };

  const step = (newValue: number, direction: -1 | 1) => {
    if (direction == -1 && newValue > maxContBandwidthMHz) return maxContBandwidthMHz;
    if (direction == 1 && newValue < minChannelWidthMHz) return minChannelWidthMHz;
    return direction === 1
      ? Math.ceil((value + 1e-9) / stepInUnits) * stepInUnits
      : Math.floor((value - 1e-9) / stepInUnits) * stepInUnits;
  };

  React.useEffect(() => {
    setErrorText(validateValue(value));
  }, [
    value,
    minimumChannelWidthHz,
    continuumBandwidthUnits,
    centralFrequency,
    centralFrequencyUnits,
    telescope,
    subarrayConfig,
    observingBand
  ]);

  const minChannelWidthMHz = frequencyConversion(
    telescope === TELESCOPE_LOW_NUM
      ? osdLOW?.basicCapabilities.coarseChannelWidthHz * LOW_COARSE_CHANNELS_PER_BANDWIDTH_STEP
      : // TODO: Mid values should come from OSD in the future - 13440 is Mid channel width in Hz
        //  and until AA2 bandwidth has to be multiple of 20 channels.
        Math.round(20 * 13440 * 1e12) / 1e12,
    FREQUENCY_HZ,
    FREQUENCY_MHZ
  );

  return (
    <SteppedNumberField
      testId={FIELD}
      label={t(FIELD + '.label')}
      value={value}
      onStep={step}
      onCommit={setValueAndValidate}
      onFocus={() => setHelp(FIELD)}
      disabled={disabled}
      required={true}
      errorText={errorText}
      suffix={suffix}
      min={minChannelWidthMHz}
      max={maxContBandwidthMHz}
    />
  );
}
