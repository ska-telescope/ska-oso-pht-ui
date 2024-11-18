import {
  ANTENNA_13M,
  ANTENNA_15M,
  ANTENNA_LOW,
  ANTENNA_MIXED,
  BANDWIDTH_TELESCOPE,
  LOW_MIN_CHANNEL_WIDTH_HZ,
  MID_MIN_CHANNEL_WIDTH_HZ,
  OBSERVATION,
  TELESCOPE_LOW_NUM
} from '../../../utils/constants';
import sensCalHelpers from '../../../services/axios/sensitivityCalculator/sensCalHelpers';

const isLow = telescope => telescope === TELESCOPE_LOW_NUM;

export const scaleBandwidthOrFrequency = (incValue: number, incUnits: string): number => {
  return sensCalHelpers.format.convertBandwidthToHz(incValue, incUnits);
};

export const getMinimumChannelWidth = (telescope: number): number =>
  isLow(telescope) ? LOW_MIN_CHANNEL_WIDTH_HZ : MID_MIN_CHANNEL_WIDTH_HZ;

export const checkMinimumChannelWidth = (
  minimumChannelWidthHz: number,
  scaledBandwidth: number
): boolean => (scaledBandwidth < minimumChannelWidthHz ? false : true);

export const getMaxContBandwidthHz = (telescope: number, subarrayConfig: number): any =>
  OBSERVATION.array
    .find(item => item.value === telescope)
    ?.subarray?.find(ar => ar.value === subarrayConfig)?.maxContBandwidthHz;

export const checkMaxContBandwidthHz = (
  maxContBandwidthHz: number | undefined,
  scaledBandwidth: number
): boolean => (maxContBandwidthHz && scaledBandwidth > maxContBandwidthHz ? false : true);

const getSubArrayAntennasCounts = (telescope: number, subarrayConfig: number) => {
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

const getBandLimits = (telescope: number, subarrayConfig: number, observingBand: number) => {
  const bandLimits = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.bandLimits;
  if (!bandLimits) {
    return [];
  }

  if (isLow(telescope)) {
    return bandLimits[ANTENNA_LOW]?.map(e => e * 1e6) || [];
  }

  const { n15mAntennas, n13mAntennas } = getSubArrayAntennasCounts(telescope, subarrayConfig);
  const limits = getBandLimitsForAntennaCounts(bandLimits, n15mAntennas, n13mAntennas);
  return limits || [];
};

// The bandwidth's lower and upper bounds should be within band limits
// Lower and upper bounds are set as frequency -/+ half bandwidth
// The band limits for each antennas (ska/meerkat/mixed) are set for each band (Mid)
// The antennas depend on the subarray selected
export const checkBandLimits = (
  scaledBandwidth: number,
  scaledFrequency: number,
  telescope: number,
  subarrayConfig: number,
  observingBand: number
) => {
  const halfBandwidth: number = scaledBandwidth / 2.0;
  const lowerBound: number = scaledFrequency - halfBandwidth;
  const upperBound: number = scaledFrequency + halfBandwidth;
  const bandLimits = getBandLimits(telescope, subarrayConfig, observingBand);
  return (bandLimits && lowerBound < bandLimits[0]) || (bandLimits && upperBound > bandLimits[1])
    ? false
    : true;
};
