import sensCalHelpers from '@/services/axios/get/getSensitivityCalculator/sensitivityCalculator/sensCalHelpers';
import {
  SA_AA2,
  ANTENNA_13M,
  ANTENNA_15M,
  ANTENNA_MIXED,
  TELESCOPE_LOW_NUM
} from '@utils/constants.ts';

const isLow = (telescope: number) => telescope === TELESCOPE_LOW_NUM;
const isAA2 = (subarrayConfig: string) => subarrayConfig === SA_AA2;

export const scaleBandwidthOrFrequency = (incValue: number, incUnits: string): number => {
  return sensCalHelpers.format.convertBandwidthToHz(incValue, incUnits);
};

// The bandwidth should be greater than the fundamental limit of the bandwidth provided by SKA MID or LOW
export const checkMinimumChannelWidth = (
  minimumChannelWidthHz: number,
  scaledBandwidth: number
): boolean => (scaledBandwidth < minimumChannelWidthHz ? false : true);

// get maximum bandwidth defined for the subarray ( Continuum )
export const getMaxContBandwidthHz = (
  telescope: number,
  band: string,
  subarrayConfig: string,
  osdMID: any,
  osdLOW: any
): any => {
  //TODO: Need to deal with custom case

  if (isLow(telescope)) {
    const sArray = osdLOW?.subArrays.find((sub: any) => sub.subArray === subarrayConfig);
    return sArray?.availableBandwidthHz;
  } else {
    const rec = osdMID?.basicCapabilities.receiverInformation.find((r: any) => r.rxId === band);
    return rec ? rec.maxFrequencyHz : undefined;
  }
};

// get maximum bandwidth defined for the subarray ( Spectral )
export const getMaxSpecBandwidthHz = (
  telescope: number,
  subarrayConfig: string,
  osdMID: any,
  osdLOW: any,
  observatoryConstants: any
): any => {
  //TODO: AA2 will be extended as OSD Data is extended
  if (isAA2(subarrayConfig)) {
    const sArray = (isLow(telescope) ? osdLOW : osdMID)?.subArrays.find(
      (sub: any) => sub.subArray === SA_AA2
    );
    return sArray?.channelWidthHz;
  } else {
    //TODO: Refactor as custom does not have this field
    return observatoryConstants.array
      .find((item: any) => item.value === telescope)
      ?.subarray?.find((ar: any) => ar.value === subarrayConfig)?.maxContBandwidthHz;
  }
};

// The bandwidth should be smaller than the maximum bandwidth defined for the subarray
// For the subarrays that don't have one set, the full bandwidth is allowed
export const checkMaxBandwidthHz = (
  maxBandwidthHz: number | undefined,
  scaledBandwidth: number
): boolean => (maxBandwidthHz && scaledBandwidth > maxBandwidthHz ? false : true);

const getSubArrayAntennasCounts = (
  osdMID: any,
  _osdLOW: any,
  observatoryConstants: any,
  telescope: number,
  subarrayConfig: string
) => {
  const observationArray = observatoryConstants.array.find((arr: any) => arr.value === telescope);
  const subArray = observationArray?.subarray?.find((sub: any) => sub.value === subarrayConfig);
  //TODO: AA2 will be extended as OSD Data is extended
  if (!isLow(telescope) && isAA2(subarrayConfig)) {
    const sArray = osdMID.subArrays.find((sub: any) => sub.subArray === SA_AA2);
    return {
      n15mAntennas: sArray?.numberSkaDishes || 0,
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

const getBandLimits = (
  telescope: number,
  subarrayConfig: string,
  observingBand: string,
  osdMID: any,
  osdLOW: any,
  observatoryConstants: any,
  findBand: Function
) => {
  const band = findBand(observingBand);
  if (!band) {
    return [band?.minFrequencyHz, band?.maxFrequencyHz];
  }
  const { n15mAntennas, n13mAntennas } = getSubArrayAntennasCounts(
    osdMID,
    osdLOW,
    observatoryConstants,
    telescope,
    subarrayConfig
  );
  const limits = getBandLimitsForAntennaCounts(band, n15mAntennas, n13mAntennas);
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
  subarrayConfig: string,
  observingBand: string,
  osdMID: any,
  osdLOW: any,
  observatoryConstants: any,
  findBand: Function
) => {
  const halfBandwidth: number = scaledBandwidth / 2.0;
  const lowerBound: number = scaledFrequency - halfBandwidth;
  const upperBound: number = scaledFrequency + halfBandwidth;
  const bandLimits = getBandLimits(
    telescope,
    subarrayConfig,
    observingBand,
    osdMID,
    osdLOW,
    observatoryConstants,
    findBand
  );
  return !(lowerBound < bandLimits?.[0] || upperBound > bandLimits?.[1]);
};
