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
import { Box } from '@mui/system';

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
  nSubBands?: number;
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
  nSubBands
}: continuumBandwidthFieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'continuumBandwidth';
  const isLow = () => observingBand === BAND_LOW;

  const scaleBandwidthOrFrequency = (incValue: number, incUnits: number): number => {
    const frequencyUnitsLabel = FREQUENCY_UNITS.find(item => item.value === incUnits)?.label;
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
    return {
      nSKA: array.numOf15mAntennas,
      nMeerkat: array.numOf13mAntennas
    };
  };

  const getMidBandLimits = () => {
    const bandLimits = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.bandLimits;
    if (!bandLimits) {
      return [];
    }

    const subArrayAntennas = getSubArrayAntennas();
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
    return limits;
  };

  const getLowBandLimits = () => {
    const bandLimits = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.bandLimits;
    if (!bandLimits) {
      return [];
    }
    const key = 'low';
    const limits = bandLimits.find(e => e.type === key)?.limits;
    const limitsInHz = limits.map(e => e * 1e6);
    return limitsInHz;
  };

  const errorMessage = () => {
    // scale bandwidth and frequency
    const scaledBandwidth = scaleBandwidthOrFrequency(value, continuumBandwidthUnits);
    const scaledFrequency = scaleBandwidthOrFrequency(centralFrequency, centralFrequencyUnits);

    // The bandwidth should be greater than the fundamental limit of the bandwidth provided by SKA MID or LOW
    const minimumChannelWidthHz = getMinimumChannelWidth();
    if (scaledBandwidth < minimumChannelWidthHz) {
      return displayMinimumChannelWidthErrorMessage(minimumChannelWidthHz);
    }

    // The bandwidth should be smaller than the maximum bandwidth defined for the subarray
    // For the subarrays that don't have one set, the full bandwidth is allowed
    const maxContBandwidthHz = getMaxContBandwidthHz();
    if (maxContBandwidthHz && scaledBandwidth > maxContBandwidthHz) {
      return displaymMaxContBandwidthErrorMessage(maxContBandwidthHz);
    }

    // The bandwidth's lower and upper bounds should be within band limits
    // Lower and upper bounds are set as frequency -/+ half bandwidth
    // The band limits for each antennas (ska/meerkat/mixed) are set for each band (Mid)
    // The antennas depend on the subarray selected
    const halfBandwidth = scaledBandwidth / 2.0;
    const lowerBound: number = scaledFrequency - halfBandwidth;
    const upperBound: number = scaledFrequency + halfBandwidth;
    const bandLimits = !isLow() ? getMidBandLimits() : getLowBandLimits(); // TODO get band limits for Low
    if ((bandLimits && lowerBound < bandLimits[0]) || (bandLimits && upperBound > bandLimits[1])) {
      return t('continuumBandWidth.range.bandwidthRangeError');
    }

    // The sub-band bandwidth defined by the bandwidth of the observation divided by the number of
    // sub-bands should be greater than the minimum allowed bandwidth
    // Mid only
    if (!isLow() && nSubBands && scaledBandwidth / nSubBands < minimumChannelWidthHz) {
      return t('continuumBandWidth.range.subBandBandwidthError');
    }

    return '';
    // TODO : handle band5a NaN cases?
    // TODO : handle zooms
  };

  return (
    <Box pt={1}>
      <NumberEntry
        label={t('continuumBandWidth.label')}
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
