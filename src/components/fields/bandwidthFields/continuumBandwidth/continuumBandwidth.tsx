import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { LAB_IS_BOLD, LAB_POSITION, TYPE_CONTINUUM } from '@utils/constants.ts';
import { getScaledBandwidthOrFrequency } from '@utils/helpers.ts';
import sensCalHelpers from '../../../../services/api/sensitivityCalculator/sensCalHelpers';
import {
  getMaxContBandwidthHz,
  checkMinimumChannelWidth,
  checkMaxContBandwidthHz,
  checkBandLimits
} from '../bandwidthValidationCommon';

interface continuumBandwidthFieldProps {
  disabled?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: number;
  suffix?: any;
  telescope?: number;
  observingBand?: number;
  continuumBandwidthUnits?: number;
  centralFrequency?: number;
  centralFrequencyUnits?: number;
  subarrayConfig?: number;
  minimumChannelWidthHz?: number;
}

export default function ContinuumBandwidthField({
  labelWidth = 5,
  onFocus,
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
}: continuumBandwidthFieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'continuumBandwidth';

  const displayMinimumChannelWidthErrorMessage = (minimumChannelWidthHz: number): string => {
    const minimumChannelWidthKHz = sensCalHelpers.format
      .convertBandwidthToKHz(minimumChannelWidthHz, 'Hz')
      .toFixed(2);
    return t('bandwidth.range.minimumChannelWidthError', {
      value: minimumChannelWidthKHz
    });
  };

  const displayMaxContBandwidthErrorMessage = (maxContBandwidthHz: number): string => {
    const maxContBandwidthMHz = sensCalHelpers.format
      .convertBandwidthToMHz(maxContBandwidthHz, 'Hz')
      .toFixed(2);
    return t('bandwidth.range.contMaximumExceededError', { value: maxContBandwidthMHz });
  };

  const errorMessage = () => {
    const scaledBandwidth = getScaledBandwidthOrFrequency(value, continuumBandwidthUnits ?? 0);
    const scaledFrequency = getScaledBandwidthOrFrequency(centralFrequency, centralFrequencyUnits);

    if (!checkMinimumChannelWidth(minimumChannelWidthHz, scaledBandwidth)) {
      return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
    }

    const maxContBandwidthHz: number | undefined = getMaxContBandwidthHz(telescope, subarrayConfig);
    if (!checkMaxContBandwidthHz(maxContBandwidthHz, scaledBandwidth)) {
      return displayMaxContBandwidthErrorMessage(maxContBandwidthHz);
    }
    if (
      !checkBandLimits(scaledBandwidth, scaledFrequency, telescope, subarrayConfig, observingBand)
    ) {
      return t('bandwidth.range.rangeError');
    }

    return '';
  };

  return (
    <Box pt={1}>
      <NumberEntry
        label={t(`bandwidth.label.${TYPE_CONTINUUM}`)}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        suffix={suffix}
        testId={FIELD}
        value={value}
        setValue={setValue}
        onFocus={onFocus}
        required
        errorText={errorMessage()}
      />
    </Box>
  );
}
