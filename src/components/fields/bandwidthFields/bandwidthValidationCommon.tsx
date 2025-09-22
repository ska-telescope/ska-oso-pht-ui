import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  ANTENNA_13M,
  ANTENNA_15M,
  ANTENNA_MIXED,
  BAND_5A_STR,
  BAND_5B_STR,
  BANDWIDTH_TELESCOPE,
  TELESCOPE_LOW_NUM
} from '@utils/constants.ts';
import sensCalHelpers from '../../../services/api/sensitivityCalculator/sensCalHelpers';
import ObservatoryData from '@/utils/types/observatoryData';
import { OBSERVATION } from '@utils/observationConstantData.ts';

const isLow = (telescope: number) => telescope === TELESCOPE_LOW_NUM;
const isAA2 = (subarrayConfig: number) => subarrayConfig === 3;

export const scaleBandwidthOrFrequency = (incValue: number, incUnits: string): number => {
  return sensCalHelpers.format.convertBandwidthToHz(incValue, incUnits);
};

// The bandwidth should be greater than the fundamental limit of the bandwidth provided by SKA MID or LOW
export const checkMinimumChannelWidth = (
  minimumChannelWidthHz: number,
  scaledBandwidth: number
): boolean => (scaledBandwidth < minimumChannelWidthHz ? false : true);

function getObservatoryData() {
  const { application } = storageObject.useStore();
  return application.content3 as ObservatoryData;
}

// get maximum bandwidth defined for the subarray
export const getMaxContBandwidthHz = (telescope: number, subarrayConfig: number): any => {
  const data = getObservatoryData();

  //TODO: AA2 will be extended as OSD Data is extended
  if (isAA2(subarrayConfig)) {
    if (isLow(telescope)) {
      return data?.capabilities?.low?.AA2?.availableBandwidthHz;
    } else {
      return data?.capabilities?.mid?.AA2?.availableBandwidthHz;
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

const getSubArrayAntennasCounts = (
  observatoryData: ObservatoryData,
  telescope: number,
  subarrayConfig: number
) => {
  const observationArray = OBSERVATION.array.find(arr => arr.value === telescope);
  const subArray = observationArray?.subarray?.find(sub => sub.value === subarrayConfig);
  //TODO: AA2 will be extended as OSD Data is extended
  if (!isLow(telescope) && isAA2(subarrayConfig)) {
    return {
      n15mAntennas: observatoryData?.capabilities?.mid?.AA2?.numberSkaDishes || 0,
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
  const observatoryData: ObservatoryData = getObservatoryData();

  const bandLimits = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.bandLimits;
  if (!bandLimits) {
    return [];
  }

  if (isLow(telescope)) {
    return [
      observatoryData.capabilities?.low?.basicCapabilities?.minFrequencyHz,
      observatoryData.capabilities?.low?.basicCapabilities?.maxFrequencyHz
    ];
  }

  function getFrequencyLimitsBand5(observingBand: string) {
    const band = observatoryData?.capabilities?.mid?.basicCapabilities?.receiverInformation.find(
      item => item?.rxId === observingBand
    );
    const minFrequencyHz = band?.minFrequencyHz;
    const maxFrequencyHz = band?.maxFrequencyHz;
    return [minFrequencyHz, maxFrequencyHz];
  }

  if (!isLow(telescope)) {
    if (observingBand === 3) {
      return getFrequencyLimitsBand5(BAND_5A_STR);
    } else if (observingBand === 4) {
      return getFrequencyLimitsBand5(BAND_5B_STR);
    }
  }

  const { n15mAntennas, n13mAntennas } = getSubArrayAntennasCounts(
    observatoryData,
    telescope,
    subarrayConfig
  );
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
  return !(
    (bandLimits && lowerBound < bandLimits[0]) ||
    (bandLimits && upperBound > bandLimits[1])
  );
};
