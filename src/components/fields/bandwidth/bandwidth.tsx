import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import {
  ANTENNA_13M,
  ANTENNA_15M,
  ANTENNA_LOW,
  ANTENNA_MIXED,
  BANDWIDTH_TELESCOPE,
  FREQUENCY_UNITS,
  LAB_IS_BOLD,
  LAB_POSITION,
  LOW_MIN_CHANNEL_WIDTH_HZ,
  MID_MIN_CHANNEL_WIDTH_HZ,
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

  const scaleBandwidthOrFrequency = (incValue: number, incUnits: string): number => {
    // const frequencyUnitsLabel = FREQUENCY_UNITS.find(item => item.value === incUnits)?.label;
    return sensCalHelpers.format.convertBandwidthToHz(incValue, incUnits);
  };

  const lookupBandwidth = (inValue: number): any =>
    OBSERVATION.array[telescope - 1]?.bandWidth.find(bw => bw.value === inValue)

  const getBandwidthUnitsLabel = (): string => {
    return lookupBandwidth(value)?.mapping;
  }

  const getBandwidthValue = (): number => {
    return Number(lookupBandwidth(value)?.label.split(" ")[0]);
  }

  const getFrequencyhUnitsLabel = (): string => {
    return FREQUENCY_UNITS.find(item => item.value === centralFrequencyUnits)?.label;
  }

  const getMinimumChannelWidth = (): number =>
    isLow() ? LOW_MIN_CHANNEL_WIDTH_HZ : MID_MIN_CHANNEL_WIDTH_HZ;

  const displayMinimumChannelWidthErrorMessage = (minimumChannelWidthHz: number): string => {
    const minimumChannelWidthKHz = sensCalHelpers.format
      .convertBandwidthToKHz(minimumChannelWidthHz, 'Hz')
      .toFixed(2);
    return t('continuumBandWidth.range.minimumChannelWidthError', {
      value: minimumChannelWidthKHz
    });
  };

  const getMaxContBandwidthHz = (): any =>
    OBSERVATION.array
      .find(item => item.value === telescope)
      ?.subarray?.find(ar => ar.value === subarrayConfig)?.maxContBandwidthHz;

  const displayMaxContBandwidthErrorMessage = (maxContBandwidthHz: number): string => {
    const maxContBandwidthMHz = sensCalHelpers.format
      .convertBandwidthToMHz(maxContBandwidthHz, 'Hz')
      .toFixed(2);
    return t('continuumBandWidth.range.contMaximumExceededError', { value: maxContBandwidthMHz });
  };

  const getSubArrayAntennasCounts = () => {
    const observationArray = OBSERVATION.array.find(arr => arr.value === telescope);
    const subArray = observationArray?.subarray?.find(sub => sub.value === subarrayConfig);
    return {
      n15mAntennas: subArray?.numOf15mAntennas || 0,
      n13mAntennas: subArray?.numOf13mAntennas || 0
    };
  };

  const getBandLimitsForAntennaCounts = (bandLimits, n15mAntennas, n13mAntennas) => {
    let limits = [];

    switch (true) {
      case n13mAntennas > 0 && !n15mAntennas:
        limits = bandLimits[ANTENNA_13M];
        break;
      case n15mAntennas > 0 && !n13mAntennas:
        limits = bandLimits[ANTENNA_15M];
        break;
      default:
        limits = bandLimits[ANTENNA_MIXED];
        break;
    }

    return limits;
  };

  const getBandLimits = () => {
    const bandLimits = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.bandLimits;
    if (!bandLimits) {
      return [];
    }

    if (isLow()) {
      return bandLimits[ANTENNA_LOW]?.map(e => e * 1e6) || [];
    }

    const { n15mAntennas, n13mAntennas } = getSubArrayAntennasCounts();
    const limits = getBandLimitsForAntennaCounts(bandLimits, n15mAntennas, n13mAntennas);
    return limits || [];
  };

  const errorMessage = () => {
    // scale bandwidth and frequency
    const bandwidthUnitsLabel = getBandwidthUnitsLabel();
    const bandwidthValue = getBandwidthValue();
    const frequencyUnitsLabel = getFrequencyhUnitsLabel();
    const scaledBandwidth = scaleBandwidthOrFrequency(bandwidthValue, bandwidthUnitsLabel);
    console.log('scaledBandwidth', scaledBandwidth);
    const scaledFrequency = scaleBandwidthOrFrequency(centralFrequency, frequencyUnitsLabel);
    console.log('scaledFrequency', scaledFrequency);

    // TODO
    // remove subbands check as only for continuum
    // create same error messages for bandwith?
    // check extra test for zoom? mid zoom resolution check?
    // TODO combine common validation for zoom and continuum into a service/utility
    // from here
    // *****************************************

    // The bandwidth should be greater than the fundamental limit of the bandwidth provided by SKA MID or LOW
    const minimumChannelWidthHz = getMinimumChannelWidth();
    if (scaledBandwidth < minimumChannelWidthHz) {
      return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
    }

    // The bandwidth should be smaller than the maximum bandwidth defined for the subarray
    // For the subarrays that don't have one set, the full bandwidth is allowed
    const maxContBandwidthHz = getMaxContBandwidthHz();
    if (maxContBandwidthHz && scaledBandwidth > maxContBandwidthHz) {
      return displayMaxContBandwidthErrorMessage(maxContBandwidthHz);
    }

    // The bandwidth's lower and upper bounds should be within band limits
    // Lower and upper bounds are set as frequency -/+ half bandwidth
    // The band limits for each antennas (ska/meerkat/mixed) are set for each band (Mid)
    // The antennas depend on the subarray selected
    const halfBandwidth = scaledBandwidth / 2.0;
      const lowerBound: number = scaledFrequency - halfBandwidth;
      const upperBound: number = scaledFrequency + halfBandwidth;
      const bandLimits = getBandLimits();
      if ((bandLimits && lowerBound < bandLimits[0]) || (bandLimits && upperBound > bandLimits[1])) {
        return t('continuumBandWidth.range.rangeError');
      }

      // *************************************************** to here

    // The sub-band bandwidth defined by the bandwidth of the observation divided by the number of
    // sub-bands should be greater than the minimum allowed bandwidth
    // Mid only
    if (!isLow() && nSubBands && scaledBandwidth / nSubBands < minimumChannelWidthHz) {
        return t('continuumBandWidth.range.subBandError');
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
