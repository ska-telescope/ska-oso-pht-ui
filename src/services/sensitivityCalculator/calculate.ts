import {
  BAND_1_STR,
  BAND_2_STR,
  BAND_3_STR,
  BAND_4_STR,
  BAND_5A_STR,
  BAND_5B_STR,
  CHANNELS_OUT_DEFAULT,
  DP_TYPE_IMAGES,
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
import type { TargetType } from '@/models/proposals/targets';
import type {
  DataProductSDPNew,
  SDPImageContinuumData,
  SDPSpectralData
} from '@/utils/types/dataProduct';
import { post, SensCalcError, SensCalcRequestOptions, SensCalcSuccess } from './client';
import type {
  ContinuumResponse,
  ContinuumResult,
  LowContinuumRequest,
  LowZoomRequest,
  MidContinuumRequest,
  MidRxBand,
  MidZoomRequest,
  ReferenceCoordinate,
  WeightingMode,
  ZoomResponse,
  ZoomResult
} from './types';

export type SensitivityResult = ContinuumResult | ZoomResult;

export const SENS_CALC_MODE = {
  CONTINUUM: 'continuum',
  ZOOM: 'zoom'
} as const;

/** A request to the calculator: the mode tells how to read its response. */
export type SensitivityRequest =
  | {
      mode: typeof SENS_CALC_MODE.CONTINUUM;
      path: string;
      body: LowContinuumRequest | MidContinuumRequest;
    }
  | { mode: typeof SENS_CALC_MODE.ZOOM; path: string; body: LowZoomRequest | MidZoomRequest };

const MID_RX_BANDS: Record<string, MidRxBand> = {
  [BAND_1_STR]: 'Band 1',
  [BAND_2_STR]: 'Band 2',
  [BAND_3_STR]: 'Band 3',
  [BAND_4_STR]: 'Band 4',
  [BAND_5A_STR]: 'Band 5a',
  [BAND_5B_STR]: 'Band 5b'
};

const referenceCoordinate = (target: TargetType): ReferenceCoordinate =>
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
  target: TargetType,
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
  target: TargetType,
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
  target: TargetType,
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
  target: TargetType,
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

const continuumRequest = (
  observation: Observation,
  target: TargetType,
  dataProduct: DataProductSDPNew
): SensitivityRequest =>
  observation.telescope === TELESCOPE_LOW_NUM
    ? {
        mode: SENS_CALC_MODE.CONTINUUM,
        path: 'low/continuum/calculate',
        body: lowContinuumRequest(observation, target, dataProduct)
      }
    : {
        mode: SENS_CALC_MODE.CONTINUUM,
        path: 'mid/continuum/calculate',
        body: midContinuumRequest(observation, target, dataProduct)
      };

const zoomRequest = (
  observation: Observation,
  target: TargetType,
  dataProduct: DataProductSDPNew
): SensitivityRequest =>
  observation.telescope === TELESCOPE_LOW_NUM
    ? {
        mode: SENS_CALC_MODE.ZOOM,
        path: 'low/zoom/calculate',
        body: lowZoomRequest(observation, target, dataProduct)
      }
    : {
        mode: SENS_CALC_MODE.ZOOM,
        path: 'mid/zoom/calculate',
        body: midZoomRequest(observation, target, dataProduct)
      };

/**
 * The sensitivity should always be calculated based on the images data product.
 * Fall back to the linked (selected) data product if no images one is available.
 * TODO: revisit once the PDM's result_details model is corrected.
 */
export const getSensitivityDataProduct = (
  observation: Observation,
  linkedId: string,
  dataProducts: DataProductSDPNew[]
): DataProductSDPNew | undefined => {
  const linked = dataProducts.find((dp) => dp.id === linkedId);
  if (!linked || linked.data.dataProductType !== DP_TYPE_VISIBLE) {
    return linked;
  }
  const images = dataProducts.find(
    (dp) => dp.observationId === observation.id && dp.data.dataProductType === DP_TYPE_IMAGES
  );
  return images ?? linked;
};

/**
 * Builds the calculator request for one target, observation and data product.
 *
 * Returns null when the calculator doesn't apply: SSO targets, PST observing mode, and any
 * observing mode the calculator doesn't support.
 */
export const buildSensitivityRequest = (
  observation: Observation,
  target: TargetType,
  dataProduct: DataProductSDPNew
): SensitivityRequest | null => {
  if (target.kind === REFERENCE_COORDINATE_TYPE_SSO.value || observation.type === TYPE_PST) {
    return null;
  }

  switch (observation.type) {
    case TYPE_CONTINUUM:
      return continuumRequest(observation, target, dataProduct);
    case TYPE_CONTINUUM_SPECTRAL:
    case TYPE_CONTINUUM_SPECTRAL_LONG:
      return continuumRequest({ ...observation, type: TYPE_CONTINUUM }, target, dataProduct);
    case TYPE_ZOOM:
    case TYPE_ZOOM_LONG:
      return zoomRequest(observation, target, dataProduct);
    default:
      return null;
  }
};

/**
 * Sends a request built by buildSensitivityRequest. Never throws: calculator errors and canceled
 * requests are returned as errors.
 */
export const sendSensitivityRequest = async (
  request: SensitivityRequest,
  options: SensCalcRequestOptions = {}
): Promise<SensCalcSuccess<SensitivityResult> | SensCalcError> => {
  if (request.mode === SENS_CALC_MODE.CONTINUUM) {
    const response = await post<ContinuumResponse>(request.path, request.body, options);
    // One result per reference coordinate; the PHT sends one
    return response.ok ? { ok: true, data: response.data[0].transformed_result } : response;
  }
  const response = await post<ZoomResponse>(request.path, request.body, options);
  // One result per reference coordinate, with one transformed result per zoom window; the PHT
  // sends one of each
  return response.ok ? { ok: true, data: response.data[0].transformed_result[0] } : response;
};
