import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { ERROR_SECS, FREQUENCY_STR_HZ, LAB_IS_BOLD, LAB_POSITION } from '@utils/constants.ts';
import { getScaledBandwidthOrFrequency } from '@utils/helpers.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import React from 'react';
import sensCalHelpers from '../../../../services/api/sensitivityCalculator/sensCalHelpers';
import {
  getMaxContBandwidthHz,
  checkMinimumChannelWidth,
  checkMaxBandwidthHz,
  checkBandLimits
} from '../bandwidthValidationCommon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface ContinuumBandwidthFieldProps {
  disabled?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue: (v: number) => void;
  value: number;
  suffix?: any;
  telescope?: number;
  observingBand?: string;
  continuumBandwidthUnits?: number;
  centralFrequency?: number;
  centralFrequencyUnits?: number;
  subarrayConfig?: string;
  minimumChannelWidthHz?: number;
}

export default function ContinuumBandwidthField({
  disabled = false,
  labelWidth = 5,
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

  // Auto-clear error text after ERROR_SECS
  React.useEffect(() => {
    if (!errorText) return;
    const timer = setTimeout(() => setErrorText(''), ERROR_SECS);
    return () => clearTimeout(timer);
  }, [errorText]);

  const displayMinimumChannelWidthErrorMessage = (
    minimumChannelWidthHz: number | undefined
  ): string => {
    const minimumChannelWidthKHz = sensCalHelpers.format
      .convertBandwidthToKHz(Number(minimumChannelWidthHz), FREQUENCY_STR_HZ)
      .toFixed(2);
    return t('bandwidth.range.minimumChannelWidthError', {
      value: minimumChannelWidthKHz
    });
  };

  const displayMaxContBandwidthErrorMessage = (maxContBandwidthHz: number | undefined): string => {
    const maxContBandwidthMHz = sensCalHelpers.format
      .convertBandwidthToMHz(Number(maxContBandwidthHz), FREQUENCY_STR_HZ)
      .toFixed(2);
    return t('bandwidth.range.contMaximumExceededError', { value: maxContBandwidthMHz });
  };

  const validateValue = (num: number) => {
    if (!Number.isFinite(num)) return '';

    const scaledBandwidth = getScaledBandwidthOrFrequency(num, continuumBandwidthUnits ?? 0);
    const scaledFrequency = getScaledBandwidthOrFrequency(centralFrequency, centralFrequencyUnits);

    const maxContBandwidthHz: number | undefined = getMaxContBandwidthHz(
      Number(telescope),
      observingBand ?? '',
      subarrayConfig ?? '',
      osdMID,
      osdLOW
    );

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
      return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
    }
    if (invalidMaxBandwidth) {
      return displayMaxContBandwidthErrorMessage(maxContBandwidthHz);
    }
    if (invalidBandLimits) {
      return t('bandwidth.range.rangeError');
    }
    return '';
  };

  const handleSetValue = (num: number) => {
    const error = validateValue(num);
    if (error) {
      setErrorText(error);
    } else {
      setErrorText('');
      setValue(num);
    }
  };

  return (
    <Box pt={1}>
      <NumberEntry
        disabled={disabled}
        label={t(FIELD + '.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        suffix={suffix}
        testId={FIELD}
        value={value}
        setValue={handleSetValue}
        onFocus={() => setHelp(FIELD)}
        required
        errorText={errorText}
      />
    </Box>
  );
}
