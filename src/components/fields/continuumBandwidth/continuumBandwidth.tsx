import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import {
  LAB_IS_BOLD,
  LAB_POSITION,
  MID_MIN_CHANNEL_WIDTH_HZ,
  LOW_MIN_CHANNEL_WIDTH_HZ,
  BAND_LOW,
  FREQUENCY_UNITS,
  OBSERVATION,
  BANDWIDTH_TELESCOPE
} from '../../../utils/constants';
import sensCalHelpers from '../../../services/axios/sensitivityCalculator/sensCalHelpers';

interface continuumBandwidthFieldProps {
  disabled?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: number;
  suffix?: any; // TODO figure out sufix type
  telescope?: number;
  observingBand?: number;
  continuumBandwidthUnits?: number;
  centralFrequency?: number;
  centralFrequencyUnits?: number;
  subarrayConfig?: number;
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
  subarrayConfig
}: continuumBandwidthFieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'continuumBandwidth';
  const isLow = () => observingBand === BAND_LOW;

  console.log('telescope', telescope);
  console.log('observingBand', observingBand);
  console.log('continuumBandwidthUnits', continuumBandwidthUnits);
  console.log('suffix', suffix);

  const scaleBandwidthOrFrequency = (incValue: number, incUnits: number): number => {
    const frequencyUnitsLabel = FREQUENCY_UNITS.find(item => item.value === incUnits)?.label;
    console.log('frequencyUnitsLabel', frequencyUnitsLabel);
    return sensCalHelpers.format.convertBandwidthToHz(incValue, frequencyUnitsLabel);
  };

  const getMinimumChannelWidth = (): number =>
    isLow() ? LOW_MIN_CHANNEL_WIDTH_HZ : MID_MIN_CHANNEL_WIDTH_HZ;

  const displayMinimumChannelWidthErrorMessage = (minimumChannelWidthHz: number): string => {
    const minimumChannelWidthKHz = sensCalHelpers.format
      .convertBandwidthToKHz(minimumChannelWidthHz, 'Hz')
      .toFixed(2);
    const minimumChannelWidthMessage = `${t('continuumBandWidth.range.minimumChannelWidthError')}`;
    return minimumChannelWidthMessage.replace('%s', minimumChannelWidthKHz);
  };

  const getMaxContBandwidthHz = (): any =>
    OBSERVATION.array
      .find(item => item.value === telescope)
      ?.subarray?.find(ar => ar.value === subarrayConfig)?.maxContBandwidthHz;

  const displaymMaxContBandwidthErrorMessage = (maxContBandwidthHz: number): string => {
    const maxContBandwidthMHz = sensCalHelpers.format
      .convertBandwidthToMHz(maxContBandwidthHz, 'Hz')
      .toFixed(2);
    const maxContBandwidthMHzMessage = `${t(
      'continuumBandWidth.range.contBandwidthMaximumExceededError'
    )}`;
    return maxContBandwidthMHzMessage.replace('%s', maxContBandwidthMHz);
  };

  const getSubArrayAntennas = () => {
    const array = OBSERVATION.array
      .find(arr => arr.value === telescope)
      ?.subarray.find(sub => sub.value === subarrayConfig);
    console.log('array', array);
    return {
      nSKA: array.numOf15mAntennas,
      nMeerkat: array.numOf13mAntennas
    };
  };

  const getMidBandLimits = () => {
    console.log('::: in getMidBandLimits');

    const bandLimits = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.bandLimits;
    console.log('/// bandLimits', bandLimits);
    if (!bandLimits) {
      return [];
    }

    const subArrayAntennas = getSubArrayAntennas();
    console.log('/// subArrayAntennas', subArrayAntennas);
    const hasSKA = subArrayAntennas.nSKA > 0;
    const hasMeerkat = subArrayAntennas.nMeerkat > 0;

    let key: string;
    if (hasMeerkat && !hasSKA) {
      key = 'meerkat';
    } else if (hasSKA && !hasMeerkat) {
      key = 'ska';
    } else {
      key = 'mixed';
    }

    const limits = bandLimits.find(e => e.type === key)?.limits;
    console.log('limits', limits);
    return limits;
  };

  const errorMessage = () => {
    // CHECK 1
    // check num values not needed
    // scale bandwidth and frequency
    // Mid continuum bandwidth scaled to HZ (check it's the case for other bands, zoom and low)
    const scaledBandwidth = scaleBandwidthOrFrequency(value, continuumBandwidthUnits);
    // Mid continuum frequency scaled to HZ (check it's the case for other bands, zoom and low)
    const scaledFrequency = scaleBandwidthOrFrequency(centralFrequency, centralFrequencyUnits);

    // CHECK 2
    // minimum channel width check
    const minimumChannelWidthHz = getMinimumChannelWidth();
    if (scaledBandwidth < minimumChannelWidthHz) {
      return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
    }

    // CHECK3
    // check maxContBandwidthHz if exists for the array
    const maxContBandwidthHz = getMaxContBandwidthHz();
    console.log('maxContBandwidthHz', maxContBandwidthHz);
    if (maxContBandwidthHz && scaledBandwidth > maxContBandwidthHz) {
      return displaymMaxContBandwidthErrorMessage(maxContBandwidthHz);
    }

    // CHECK4
    // check bandwidth's lower and upper bounds are within band limits
    const halfBandwidth = scaledBandwidth / 2.0;
    const lowerBound: number = scaledFrequency - halfBandwidth;
    const upperBound: number = scaledFrequency + halfBandwidth;
    const bandLimits = !isLow() ? getMidBandLimits() : 0; // TODO get band limits for Low

    console.log('bandLimits', bandLimits);
    if ((bandLimits && lowerBound < bandLimits[0]) || (bandLimits && upperBound > bandLimits[1])) {
      return t('continuumBandWidth.range.bandwidthRangeError');
    }

    return '';
    // TODO handle low bandLimits
    // TODO : handle band5a NaN cases
    // TODO : handle zooms
  };

  return (
    <NumberEntry
      label={t('continuumBandWidth.label')}
      labelBold={LAB_IS_BOLD}
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      suffix={suffix}
      testId={FIELD}
      value={value}
      // setValue={validate}
      setValue={setValue}
      onFocus={onFocus}
      required
      errorText={errorMessage()}
    />
  );
}
