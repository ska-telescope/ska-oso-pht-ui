import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import {
  FREQUENCY_UNITS,
  LAB_IS_BOLD,
  LAB_POSITION,
  OBSERVATION,
  TELESCOPE_LOW_NUM,
  TYPE_ZOOM
} from '../../../../utils/constants';
import sensCalHelpers from '../../../../services/axios/sensitivityCalculator/sensCalHelpers';
import {
  scaleBandwidthOrFrequency,
  getMinimumChannelWidth,
  getMaxContBandwidthHz,
  checkMinimumChannelWidth,
  checkMaxContBandwidthHz,
  checkBandLimits
} from '../bandwidthValidationCommon';

interface BandwidthFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  testId: string;
  telescope: number;
  value: number;
  widthButton?: number;
  widthLabel?: number;
  observingBand?: number;
  centralFrequency?: number;
  centralFrequencyUnits?: number;
  subarrayConfig?: number;
}

export default function BandwidthField({
  disabled = false,
  onFocus,
  required = false,
  setValue = null,
  suffix = null,
  value,
  telescope,
  testId,
  widthButton,
  widthLabel = 5,
  observingBand,
  centralFrequency,
  centralFrequencyUnits,
  subarrayConfig
}: BandwidthFieldProps) {
  const { t } = useTranslation('pht');
  const isLow = () => telescope === TELESCOPE_LOW_NUM;

  const getOptions = () => {
    return OBSERVATION.array[telescope - 1].bandWidth;
  };
  const roundBandwidthValue = options =>
    options.map(obj => {
      return {
        label: `${parseFloat(obj.label).toFixed(1)} ${obj.label.split(' ')[1]}`,
        value: obj.value,
        mapping: obj.mapping
      };
    });

  const lookupBandwidth = (inValue: number): any =>
    OBSERVATION.array[telescope - 1]?.bandWidth.find(bw => bw.value === inValue);

  const getBandwidthUnitsLabel = (): string => {
    return lookupBandwidth(value)?.mapping;
  };

  const getBandwidthValue = (): number => {
    return Number(lookupBandwidth(value)?.label.split(' ')[0]);
  };

  const getFrequencyhUnitsLabel = (): string => {
    return FREQUENCY_UNITS.find(item => item.value === centralFrequencyUnits)?.label;
  };

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
    // scale bandwidth and frequency
    const bandwidthUnitsLabel = getBandwidthUnitsLabel();
    const bandwidthValue = getBandwidthValue();
    const frequencyUnitsLabel = getFrequencyhUnitsLabel();
    const scaledBandwidth = scaleBandwidthOrFrequency(bandwidthValue, bandwidthUnitsLabel);
    const scaledFrequency = scaleBandwidthOrFrequency(centralFrequency, frequencyUnitsLabel);

    // TODO
    // keep same error messages for bandwith? duplication?
    // check extra test for zoom? mid zoom resolution check?

    // The bandwidth should be greater than the fundamental limit of the bandwidth provided by SKA MID or LOW
    const minimumChannelWidthHz = getMinimumChannelWidth(telescope);
    if (!checkMinimumChannelWidth(minimumChannelWidthHz, scaledBandwidth)) {
      return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
    }

    // The bandwidth should be smaller than the maximum bandwidth defined for the subarray
    // For the subarrays that don't have one set, the full bandwidth is allowed
    const maxContBandwidthHz: number | undefined = getMaxContBandwidthHz(telescope, subarrayConfig);
    if (!checkMaxContBandwidthHz(maxContBandwidthHz, scaledBandwidth)) {
      return displayMaxContBandwidthErrorMessage(maxContBandwidthHz);
    }

    // The bandwidth's lower and upper bounds should be within band limits
    // Lower and upper bounds are set as frequency -/+ half bandwidth
    // The band limits for each antennas (ska/meerkat/mixed) are set for each band (Mid)
    // The antennas depend on the subarray selected
    if (
      !checkBandLimits(scaledBandwidth, scaledFrequency, telescope, subarrayConfig, observingBand)
    ) {
      return t('bandwidth.range.rangeError');
    }

    return '';
  };

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} item xs={suffix ? 12 - widthButton : 12}>
        <DropDown
          disabled={disabled}
          options={isLow() ? roundBandwidthValue(getOptions()) : getOptions()}
          testId={testId}
          value={value}
          setValue={setValue}
          label={t(`bandwidth.label.${TYPE_ZOOM}`)}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={suffix ? widthLabel + 1 : widthLabel}
          onFocus={onFocus}
          required={required}
          errorText={errorMessage()}
        />
      </Grid>
      <Grid item xs={suffix ? widthButton : 0}>
        {suffix}
      </Grid>
    </Grid>
  );
}
