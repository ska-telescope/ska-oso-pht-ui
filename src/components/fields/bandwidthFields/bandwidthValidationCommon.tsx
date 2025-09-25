import {
  ANTENNA_13M,
  ANTENNA_15M,
  ANTENNA_MIXED,
  BAND_1_STR,
  BAND_2_STR,
  BAND_5A_STR,
  BAND_5B_STR,
  BANDWIDTH_TELESCOPE,
  TELESCOPE_LOW_NUM
} from '@utils/constants.ts';
import { OBSERVATION } from '@utils/observationConstantData.ts';
import sensCalHelpers from '../../../services/api/sensitivityCalculator/sensCalHelpers';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

const isLow = (telescope: number) => telescope === TELESCOPE_LOW_NUM;
const isAA2 = (subarrayConfig: number) => subarrayConfig === 3;

const GetCapabilities = () => {
  const { osdCapabilities } = useOSDAccessors();
  return osdCapabilities;
};

export const scaleBandwidthOrFrequency = (incValue: number, incUnits: string): number => {
  return sensCalHelpers.format.convertBandwidthToHz(incValue, incUnits);
};

// The bandwidth should be greater than the fundamental limit of the bandwidth provided by SKA MID or LOW
export const checkMinimumChannelWidth = (
  minimumChannelWidthHz: number | undefined,
  scaledBandwidth: number
): boolean => (scaledBandwidth < minimumChannelWidthHz ? false : true);

// get maximum bandwidth defined for the subarray
export const getMaxContBandwidthHz = (
  telescope: number | undefined,
  subarrayConfig: number | undefined
): any => {
  const cap: any = GetCapabilities();
  const low = cap?.low;
  const mid = cap?.mid;
  //TODO: AA2 will be extended as OSD Data is extended
  if (isAA2(subarrayConfig)) {
    if (isLow(telescope)) {
      return low?.AA2?.availableBandwidthHz;
    } else {
      return mid?.AA2?.availableBandwidthHz;
    }
  } else {
    return OBSERVATION.array
      .find(item => item.value === telescope)
      ?.subarray?.find(ar => ar.value === subarrayConfig)?.maxContBandwidthHz;
  }
};

// The bandwidth should be smaller than the maximum bandwidth defined for the subarray
// For the subarrays that don't have one set, the full bandwidth is allowed
export const checkMaxContBandwidthHz = (
  maxContBandwidthHz: number | undefined,
  scaledBandwidth: number
): boolean => (maxContBandwidthHz && scaledBandwidth > maxContBandwidthHz ? false : true);

const getSubArrayAntennasCounts = (telescope: number, subarrayConfig: number) => {
  const cap: any = GetCapabilities();
  const observationArray = OBSERVATION.array.find(arr => arr.value === telescope);
  const subArray = observationArray?.subarray?.find(sub => sub.value === subarrayConfig);
  //TODO: AA2 will be extended as OSD Data is extended
  if (!isLow(telescope) && isAA2(subarrayConfig)) {
    return {
      n15mAntennas: cap?.mid?.AA2?.numberSkaDishes || 0,
      n13mAntennas: subArray?.numOf13mAntennas || 0
    };
  } else {
    return {
      n15mAntennas: subArray?.numOf15mAntennas || 0,
      n13mAntennas: subArray?.numOf13mAntennas || 0
    };
  }
};

const getBandLimitsForAntennaCounts = (
  bandLimits:
    | { low: any[]; '15m'?: any[]; '13m'?: any[]; mixed?: any[] }
    | { '15m': any[]; '13m': any[]; mixed: any[]; low?: any[] }
    | { '15m': any[]; low?: any[]; '13m'?: any[]; mixed?: any[] },
  n15mAntennas: number,
  n13mAntennas: number
) => {
  let limits = [];
  switch (true) {
    case n13mAntennas > 0 && !n15mAntennas:
      limits = bandLimits[ANTENNA_13M] ?? [];
      break;
    case n15mAntennas > 0 && !n13mAntennas:
      limits = bandLimits[ANTENNA_15M] ?? [];
      break;
    default:
      limits = bandLimits[ANTENNA_MIXED] ?? [];
      break;
  }
  return limits;
};

const getBandLimits = (telescope: number, subarrayConfig: number, observingBand: number) => {
  const cap: any = GetCapabilities();
  const bandLimits = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.bandLimits;
  if (!bandLimits) {
    return [];
  }

  if (isLow(telescope)) {
    return [
      cap?.low?.basicCapabilities?.minFrequencyHz,
      cap?.low?.basicCapabilities?.maxFrequencyHz
    ];
  }

  function getMidFrequencyLimits(observingBand: string) {
    const cap: any = GetCapabilities();
    const band = cap?.mid?.basicCapabilities?.receiverInformation.find(
      item => item?.rxId === observingBand
    );
    const minFrequencyHz = band?.minFrequencyHz;
    const maxFrequencyHz = band?.maxFrequencyHz;
    return [minFrequencyHz, maxFrequencyHz];
  }

  if (!isLow(telescope)) {
    switch (observingBand) {
      case 1:
        return getMidFrequencyLimits(BAND_1_STR);
      case 2:
        return getMidFrequencyLimits(BAND_2_STR);
      case 3:
        return getMidFrequencyLimits(BAND_5A_STR);
      case 4:
        return getMidFrequencyLimits(BAND_5B_STR);
    }
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
  telescope: number | undefined,
  subarrayConfig: number | undefined,
  observingBand: number | undefined
) => {
  const halfBandwidth: number = scaledBandwidth / 2.0;
  const lowerBound: number = scaledFrequency - halfBandwidth;
  const upperBound: number = scaledFrequency + halfBandwidth;
  const bandLimits = getBandLimits(telescope, subarrayConfig, observingBand);
  return !(
    (bandLimits && lowerBound < bandLimits[0]) ||
    (bandLimits && upperBound > bandLimits[1])
  );
};
