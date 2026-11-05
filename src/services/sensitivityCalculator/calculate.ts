import {
  BAND_1_STR,
  BAND_2_STR,
  BAND_3_STR,
  BAND_4_STR,
  BAND_5A_STR,
  BAND_5B_STR,
  CHANNELS_OUT_DEFAULT,
  DP_TYPE_VISIBLE,
  FREQUENCY_HZ,
  FREQUENCY_KHZ,
  FREQUENCY_MHZ,
  IMAGE_WEIGHTING_DEFAULT,
  IW_BRIGGS,
  IW_UNIFORM,
  LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_SSO,
  ROBUST_DEFAULT,
  SA_CUSTOM,
  TAPER_DEFAULT,
  TELESCOPE_LOW_NUM,
  TIME_HOURS,
  TIME_SECS,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_PST,
  TYPE_ZOOM,
  TYPE_ZOOM_LONG
} from '@/utils/constants';
import { OSD_CONSTANTS } from '@/utils/OSDConstants';
import { frequencyConversion, getBandwidthZoom, getSpectralResolutionHz } from '@/utils/helpers';
import { getImageWeightingMapping, timeConversion } from '@/utils/helpersSensCalc';
import type Observation from '@/utils/types/observation';
import type Target from '@/utils/types/target';
import type {
  DataProductSDPNew,
  SDPImageContinuumData,
  SDPSpectralData
} from '@/utils/types/dataProduct';
import {
  postLowContinuum,
  postLowZoom,
  postMidContinuum,
  postMidZoom,
  SENS_CALC_ERROR_KIND,
  SensCalcError,
  SensCalcRequestOptions,
  SensCalcSuccess
} from './client';
import type {
  ContinuumResult,
  LowContinuumRequest,
  LowZoomRequest,
  MidContinuumRequest,
  MidRxBand,
  MidZoomRequest,
  ReferenceCoordinate,
  WeightingMode,
  ZoomResult
} from './types';

export type SensitivityResult = ContinuumResult | ZoomResult;

const MID_RX_BANDS: Record<string, MidRxBand> = {
  [BAND_1_STR]: 'Band 1',
  [BAND_2_STR]: 'Band 2',
  [BAND_3_STR]: 'Band 3',
  [BAND_4_STR]: 'Band 4',
  [BAND_5A_STR]: 'Band 5a',
  [BAND_5B_STR]: 'Band 5b'
};

const referenceCoordinate = (target: Target): ReferenceCoordinate =>
  target.kind === REFERENCE_COORDINATE_TYPE_GALACTIC.value
    ? { kind: 'galactic', l: Number(target.l), b: Number(target.b) }
    : { kind: 'icrs', ra_str: target.raStr ?? '', dec_str: target.decStr ?? '' };

const subarrayConfiguration = (observation: Observation) =>
  OSD_CONSTANTS.array
    .find((telescope) => telescope.value === observation.telescope)
    ?.subarray?.find((subarray) => subarray.value === observation.subarray)?.map ?? '';

const isCustomSubarray = (observation: Observation) => observation.subarray === SA_CUSTOM;

const lowArray = (observation: Observation) =>
  isCustomSubarray(observation)
    ? { num_stations: observation.numStations ?? 0 }
    : { subarray_configuration: subarrayConfiguration(observation) };

const midArray = (observation: Observation) =>
  isCustomSubarray(observation)
    ? { n_ska: observation.num15mAntennas ?? 0, n_meer: observation.num13mAntennas ?? 0 }
    : { subarray_configuration: subarrayConfiguration(observation).toUpperCase() };

const imageData = (dataProduct: DataProductSDPNew) =>
  dataProduct.data as Partial<SDPImageContinuumData | SDPSpectralData>;

const weighting = (dataProduct: DataProductSDPNew, defaultWeighting: number) => {
  const data = imageData(dataProduct);
  const weightingValue = data.weighting ?? defaultWeighting;
  return {
    weighting_mode: getImageWeightingMapping(weightingValue) as WeightingMode,
    ...(weightingValue === IW_BRIGGS && { robustness: data.robust ?? ROBUST_DEFAULT })
  };
};

const taper = (dataProduct: DataProductSDPNew) =>
  imageData(dataProduct).taperValue ?? TAPER_DEFAULT;

const integrationTime = (observation: Observation, unit: number) =>
  timeConversion(observation.supplied.value, observation.supplied.units, unit);

const centralFrequency = (observation: Observation, unit: number) =>
  frequencyConversion(observation.centralFrequency, observation.centralFrequencyUnits, unit);

const continuumBandwidth = (observation: Observation, unit: number) =>
  frequencyConversion(
    observation.continuumBandwidth ?? 0,
    observation.continuumBandwidthUnits as number,
    unit
  );

/**
 * The number of LOW continuum channels averaged into each output channel of the data product.
 * Continuum visibilities always use the default number of output channels.
 */
export const getLowSpectralAveragingFactor = (
  observation: Observation,
  dataProduct: DataProductSDPNew
) => {
  const totalChannels =
    continuumBandwidth(observation, FREQUENCY_KHZ) / LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ;

  const data = dataProduct.data as Partial<SDPImageContinuumData>;
  const channelsOut =
    observation.type === TYPE_CONTINUUM && data.dataProductType === DP_TYPE_VISIBLE
      ? CHANNELS_OUT_DEFAULT
      : Number(data.channelsOut);

  // Spectral results are ignored for a single output channel, but the calculator requires a value
  if (channelsOut === 1) {
    return 1;
  }

  return Math.floor(totalChannels / channelsOut);
};

// The MID correlator only offers a fixed set of averaging factors; no averaging is applied
const MID_SPECTRAL_AVERAGING_FACTOR = 1;

const lowContinuumRequest = (
  observation: Observation,
  target: Target,
  dataProduct: DataProductSDPNew
): LowContinuumRequest => ({
  ...lowArray(observation),
  ...weighting(dataProduct, IW_UNIFORM),
  integration_time_h: integrationTime(observation, TIME_HOURS),
  elevation_limit: Number(observation.elevation),
  freq_centre_mhz: centralFrequency(observation, FREQUENCY_MHZ),
  bandwidth_mhz: continuumBandwidth(observation, FREQUENCY_MHZ),
  spectral_averaging_factor: getLowSpectralAveragingFactor(observation, dataProduct),
  n_subbands: observation.numSubBands ?? 1,
  reference_coordinates: [referenceCoordinate(target)]
});

const midContinuumRequest = (
  observation: Observation,
  target: Target,
  dataProduct: DataProductSDPNew
): MidContinuumRequest => ({
  ...midArray(observation),
  ...weighting(dataProduct, IW_UNIFORM),
  rx_band: MID_RX_BANDS[observation.observingBand],
  integration_time_s: integrationTime(observation, TIME_SECS),
  taper: taper(dataProduct),
  el: Number(observation.elevation),
  freq_centre_hz: centralFrequency(observation, FREQUENCY_HZ),
  bandwidth_hz: continuumBandwidth(observation, FREQUENCY_HZ),
  spectral_averaging_factor: MID_SPECTRAL_AVERAGING_FACTOR,
  n_subbands: observation.numSubBands ?? 1,
  reference_coordinates: [referenceCoordinate(target)]
});

const lowZoomRequest = (
  observation: Observation,
  target: Target,
  dataProduct: DataProductSDPNew
): LowZoomRequest => ({
  ...lowArray(observation),
  ...weighting(dataProduct, IMAGE_WEIGHTING_DEFAULT),
  integration_time_h: integrationTime(observation, TIME_HOURS),
  elevation_limit: Number(observation.elevation),
  freq_centres_mhz: [centralFrequency(observation, FREQUENCY_MHZ)],
  spectral_resolutions_hz: [getSpectralResolutionHz(observation)],
  total_bandwidths_khz: [
    frequencyConversion(getBandwidthZoom(observation).value, FREQUENCY_MHZ, FREQUENCY_KHZ)
  ],
  reference_coordinates: [referenceCoordinate(target)]
});

const midZoomRequest = (
  observation: Observation,
  target: Target,
  dataProduct: DataProductSDPNew
): MidZoomRequest => ({
  ...midArray(observation),
  ...weighting(dataProduct, IMAGE_WEIGHTING_DEFAULT),
  rx_band: MID_RX_BANDS[observation.observingBand],
  integration_time_s: integrationTime(observation, TIME_SECS),
  taper: taper(dataProduct),
  el: Number(observation.elevation),
  freq_centres_hz: [centralFrequency(observation, FREQUENCY_HZ)],
  spectral_resolutions_hz: [getSpectralResolutionHz(observation)],
  // TODO The calculator rejects MID zoom bandwidths below 3.125 MHz, so narrower MID zooms fail
  //  validation. Revisit after SV call delivery.
  total_bandwidths_hz: [
    frequencyConversion(getBandwidthZoom(observation).value, FREQUENCY_MHZ, FREQUENCY_HZ)
  ],
  reference_coordinates: [referenceCoordinate(target)]
});

const calculateContinuum = async (
  observation: Observation,
  target: Target,
  dataProduct: DataProductSDPNew,
  options: SensCalcRequestOptions
): Promise<SensCalcSuccess<SensitivityResult> | SensCalcError> => {
  const response =
    observation.telescope === TELESCOPE_LOW_NUM
      ? await postLowContinuum(lowContinuumRequest(observation, target, dataProduct), options)
      : await postMidContinuum(midContinuumRequest(observation, target, dataProduct), options);
  // One result per reference coordinate; the PHT sends one
  return response.ok ? { ok: true, data: response.data[0].transformed_result } : response;
};

const calculateZoom = async (
  observation: Observation,
  target: Target,
  dataProduct: DataProductSDPNew,
  options: SensCalcRequestOptions
): Promise<SensCalcSuccess<SensitivityResult> | SensCalcError> => {
  const response =
    observation.telescope === TELESCOPE_LOW_NUM
      ? await postLowZoom(lowZoomRequest(observation, target, dataProduct), options)
      : await postMidZoom(midZoomRequest(observation, target, dataProduct), options);
  // One result per reference coordinate, with one transformed result per zoom window; the PHT
  // sends one of each
  return response.ok ? { ok: true, data: response.data[0].transformed_result[0] } : response;
};

/**
 * Calculates the sensitivity for one target, observation and data product.
 *
 * Returns null when the calculator doesn't apply (SSO targets and PST observing mode), in
 * which case no request is made. Never throws: calculator errors and canceled requests are
 * returned as errors.
 */
export const calculateSensitivity = async (
  observation: Observation,
  target: Target,
  dataProduct: DataProductSDPNew,
  options: SensCalcRequestOptions = {}
): Promise<SensCalcSuccess<SensitivityResult> | SensCalcError | null> => {
  if (target.kind === REFERENCE_COORDINATE_TYPE_SSO.value || observation.type === TYPE_PST) {
    return null;
  }

  switch (observation.type) {
    case TYPE_CONTINUUM:
      return calculateContinuum(observation, target, dataProduct, options);
    case TYPE_CONTINUUM_SPECTRAL:
    case TYPE_CONTINUUM_SPECTRAL_LONG:
      return calculateContinuum(
        { ...observation, type: TYPE_CONTINUUM },
        target,
        dataProduct,
        options
      );
    case TYPE_ZOOM:
    case TYPE_ZOOM_LONG:
      return calculateZoom(observation, target, dataProduct, options);
    default:
      return {
        ok: false,
        kind: SENS_CALC_ERROR_KIND.FAILED,
        title: 'Unsupported Observation Type',
        detail: `Observation type ${observation.type} is not supported by the Sensitivity Calculator.`
      };
  }
};
