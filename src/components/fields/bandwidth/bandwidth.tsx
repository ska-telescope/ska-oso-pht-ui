import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import {
  FREQUENCY_UNITS,
  LAB_IS_BOLD,
  LAB_POSITION,
  OBSERVATION,
  TELESCOPE_LOW_NUM
} from '../../../utils/constants';
import sensCalHelpers from '../../../services/axios/sensitivityCalculator/sensCalHelpers';

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
  nSubBands?: number;
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
  subarrayConfig,
  nSubBands
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

    const scaleBandwidthOrFrequency = (incValue: number, incUnits: number): number => {
      const frequencyUnitsLabel = FREQUENCY_UNITS.find(item => item.value === incUnits)?.label;
      return sensCalHelpers.format.convertBandwidthToHz(incValue, frequencyUnitsLabel);
    };

    const errorMessage = () => {
      const   bandwidthUnits = 0; // TODO extract bandwidth units from field
      console.log('bandwidth', value);

      // scale bandwidth and frequency
      //const scaledBandwidth = scaleBandwidthOrFrequency(value, bandwidthUnits);
      //const scaledFrequency = scaleBandwidthOrFrequency(centralFrequency, centralFrequencyUnits);
  
      // The bandwidth should be greater than the fundamental limit of the bandwidth provided by SKA MID or LOW
      /* const minimumChannelWidthHz = getMinimumChannelWidth();
      if (scaledBandwidth < minimumChannelWidthHz) {
        return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
      } */
  
      // The bandwidth should be smaller than the maximum bandwidth defined for the subarray
      // For the subarrays that don't have one set, the full bandwidth is allowed
      /* const maxContBandwidthHz = getMaxContBandwidthHz();
      if (maxContBandwidthHz && scaledBandwidth > maxContBandwidthHz) {
        return displayMaxContBandwidthErrorMessage(maxContBandwidthHz);
      } */
  
      // The bandwidth's lower and upper bounds should be within band limits
      // Lower and upper bounds are set as frequency -/+ half bandwidth
      // The band limits for each antennas (ska/meerkat/mixed) are set for each band (Mid)
      // The antennas depend on the subarray selected
      /* const halfBandwidth = scaledBandwidth / 2.0;
      const lowerBound: number = scaledFrequency - halfBandwidth;
      const upperBound: number = scaledFrequency + halfBandwidth;
      const bandLimits = getBandLimits();
      if ((bandLimits && lowerBound < bandLimits[0]) || (bandLimits && upperBound > bandLimits[1])) {
        return t('continuumBandWidth.range.rangeError');
      } */
  
      // The sub-band bandwidth defined by the bandwidth of the observation divided by the number of
      // sub-bands should be greater than the minimum allowed bandwidth
      // Mid only
      /* if (!isLow() && nSubBands && scaledBandwidth / nSubBands < minimumChannelWidthHz) {
        return t('continuumBandWidth.range.subBandError');
      } */
  
      return 'wrong';
      // TODO : handle band5a NaN cases?
      // TODO : handle zooms
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
          label={t('bandwidth.label')}
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
