import {
  BAND_1_STR,
  BAND_2_STR,
  BAND_3_STR,
  BAND_4_STR,
  BAND_5A_STR,
  BAND_5B_STR,
  CHANNELS_OUT_DEFAULT,
  type FrequencyUnit,
  LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_SSO,
  ROBUST_DEFAULT,
  SA_CUSTOM,
  TAPER_DEFAULT,
  SA_AA2,
  SA_AA_STAR
} from '@/utils/constants';
import { convertFrequency } from '@/utils/helpers';
import {
  INTEGRATION_TIME_UNIT_HOURS,
  MID_CHANNEL_WIDTH_HZ,
  OBSERVING_MODE,
  TELESCOPE,
  zoomChannelWidthHz,
  type Subarray,
  type Telescope,
  type LowObservationValues,
  type MidObservationValues,
  type ObservationInput,
  type ObservationValues
} from '@/models/proposals/observations';
import type { TargetType } from '@/models/proposals/targets';
import { ImageWeighting } from '@/generated/models';
import {
  DATA_PRODUCT_KIND,
  type DataProductInput,
  isImageDataProduct
} from '@/models/proposals/dataProducts';
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

const MID_RX_BANDS: Record<MidObservationValues['observingBand'], MidRxBand> = {
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

// The calculator's name for each named subarray. A custom one sends its stations or antennas.
// The calculator has no SV subarrays: AA2 for SV is calculated as AA2.
const CALCULATOR_SUBARRAY: Record<
  Telescope,
  Record<Exclude<Subarray, typeof SA_CUSTOM>, string>
> = {
  [TELESCOPE.LOW]: { [SA_AA2]: 'LOW_AA2_all', [SA_AA_STAR]: 'LOW_AAstar_all' },
  [TELESCOPE.MID]: { [SA_AA2]: 'AA2', [SA_AA_STAR]: 'AA*' }
};

const lowArray = (observation: LowObservationValues) =>
  observation.subarray === SA_CUSTOM
    ? { num_stations: observation.numberOfStations ?? 0 }
    : { subarray_configuration: CALCULATOR_SUBARRAY[TELESCOPE.LOW][observation.subarray] };

const midArray = (observation: MidObservationValues) =>
  observation.subarray === SA_CUSTOM
    ? { n_ska: observation.number15mAntennas ?? 0, n_meer: observation.number13mAntennas ?? 0 }
    : { subarray_configuration: CALCULATOR_SUBARRAY[TELESCOPE.MID][observation.subarray] };

// The calculator's name for each weighting: it calls Briggs weighting 'robust'
const WEIGHTING_MODE: Record<ImageWeighting, WeightingMode> = {
  [ImageWeighting.Natural]: 'natural',
  [ImageWeighting.Uniform]: 'uniform',
  [ImageWeighting.Briggs]: 'robust'
};

// A data product without a weighting of its own (visibilities) uses the mode's default
const weighting = (dataProduct: DataProductInput, defaultWeighting: ImageWeighting) => {
  const weight = isImageDataProduct(dataProduct)
    ? dataProduct.weighting
    : { type: defaultWeighting };
  return {
    weighting_mode: WEIGHTING_MODE[weight.type],
    ...(weight.type === ImageWeighting.Briggs && {
      robustness: ('robust' in weight ? weight.robust : undefined) ?? ROBUST_DEFAULT
    })
  };
};

const taper = (dataProduct: DataProductInput) =>
  isImageDataProduct(dataProduct) ? dataProduct.taper : TAPER_DEFAULT;

const integrationTimeHours = (observation: ObservationValues) =>
  observation.integrationTime.value * INTEGRATION_TIME_UNIT_HOURS[observation.integrationTime.unit];

const inUnit = (frequency: { value: number; unit: FrequencyUnit }, unit: FrequencyUnit) =>
  convertFrequency(frequency.value, frequency.unit, unit);

/**
 * The number of LOW continuum channels averaged into each output channel of the data product,
 * for a continuum bandwidth. Continuum visibilities always use the default number of output
 * channels.
 */
export const getLowSpectralAveragingFactor = (
  bandwidthKhz: number,
  dataProduct: DataProductInput
) => {
  const totalChannels = bandwidthKhz / LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ;

  const channelsOut = isImageDataProduct(dataProduct)
    ? dataProduct.channelsOut
    : CHANNELS_OUT_DEFAULT;

  // Spectral results are ignored for a single output channel, but the calculator requires a value
  if (channelsOut === 1) {
    return 1;
  }

  return Math.floor(totalChannels / channelsOut);
};

// The MID correlator only offers a fixed set of averaging factors; no averaging is applied
const MID_SPECTRAL_AVERAGING_FACTOR = 1;

type ContinuumObservation<T> = Extract<
  T,
  { observingMode: typeof OBSERVING_MODE.CONTINUUM | typeof OBSERVING_MODE.CONTINUUM_SPECTRAL }
>;
type SpectralObservation<T> = Extract<T, { observingMode: typeof OBSERVING_MODE.SPECTRAL }>;

const lowContinuumRequest = (
  observation: ContinuumObservation<LowObservationValues>,
  target: TargetType,
  dataProduct: DataProductInput
): LowContinuumRequest => ({
  ...lowArray(observation),
  ...weighting(dataProduct, ImageWeighting.Uniform),
  integration_time_h: integrationTimeHours(observation),
  elevation_limit: observation.minElevation,
  freq_centre_mhz: inUnit(observation.centralFrequency, 'MHz'),
  bandwidth_mhz: inUnit(observation.bandwidth, 'MHz'),
  spectral_averaging_factor: getLowSpectralAveragingFactor(
    inUnit(observation.bandwidth, 'kHz'),
    dataProduct
  ),
  n_subbands: 1,
  reference_coordinates: [referenceCoordinate(target)]
});

const midContinuumRequest = (
  observation: ContinuumObservation<MidObservationValues>,
  target: TargetType,
  dataProduct: DataProductInput
): MidContinuumRequest => ({
  ...midArray(observation),
  ...weighting(dataProduct, ImageWeighting.Uniform),
  rx_band: MID_RX_BANDS[observation.observingBand],
  integration_time_s: integrationTimeHours(observation) * 3600,
  taper: taper(dataProduct),
  el: observation.elevation,
  freq_centre_hz: inUnit(observation.centralFrequency, 'Hz'),
  bandwidth_hz: inUnit(observation.bandwidth, 'Hz'),
  spectral_averaging_factor: MID_SPECTRAL_AVERAGING_FACTOR,
  n_subbands: observation.numberOfSubBands,
  reference_coordinates: [referenceCoordinate(target)]
});

const lowZoomRequest = (
  observation: SpectralObservation<LowObservationValues>,
  target: TargetType,
  dataProduct: DataProductInput
): LowZoomRequest => ({
  ...lowArray(observation),
  ...weighting(dataProduct, ImageWeighting.Briggs),
  integration_time_h: integrationTimeHours(observation),
  elevation_limit: observation.minElevation,
  freq_centres_mhz: [inUnit(observation.centralFrequency, 'MHz')],
  spectral_resolutions_hz: [zoomChannelWidthHz(observation.telescope, observation.zoomFactor)],
  total_bandwidths_khz: [
    convertFrequency(
      observation.zoomChannels * zoomChannelWidthHz(observation.telescope, observation.zoomFactor),
      'Hz',
      'kHz'
    )
  ],
  reference_coordinates: [referenceCoordinate(target)]
});

const midZoomRequest = (
  observation: SpectralObservation<MidObservationValues>,
  target: TargetType,
  dataProduct: DataProductInput
): MidZoomRequest => ({
  ...midArray(observation),
  ...weighting(dataProduct, ImageWeighting.Briggs),
  rx_band: MID_RX_BANDS[observation.observingBand],
  integration_time_s: integrationTimeHours(observation) * 3600,
  taper: taper(dataProduct),
  el: observation.elevation,
  freq_centres_hz: [inUnit(observation.centralFrequency, 'Hz')],
  spectral_resolutions_hz: [zoomChannelWidthHz(observation.telescope, observation.zoomFactor)],
  // TODO The calculator rejects MID zoom bandwidths below 3.125 MHz, so narrower MID zooms fail
  //  validation. Revisit after SV call delivery.
  total_bandwidths_hz: [
    observation.zoomChannels * zoomChannelWidthHz(observation.telescope, observation.zoomFactor)
  ],
  reference_coordinates: [referenceCoordinate(target)]
});

/**
 * The spectral resolution the calculator uses for an observation and data product, in kHz: LOW
 * continuum channels averaged into the data product's output channels, a MID channel, or the
 * width of a zoom channel. Null while what it depends on isn't set, and for PST, which isn't
 * calculated.
 */
export const sensitivitySpectralResolutionKhz = (
  observation: ObservationInput,
  dataProduct: DataProductInput
): number | null => {
  switch (observation.observingMode) {
    case OBSERVING_MODE.SPECTRAL:
      return observation.zoomFactor === null
        ? null
        : convertFrequency(
            zoomChannelWidthHz(observation.telescope, observation.zoomFactor),
            'Hz',
            'kHz'
          );
    case OBSERVING_MODE.PST:
      return null;
    default: {
      if (observation.telescope === TELESCOPE.MID) {
        return MID_SPECTRAL_AVERAGING_FACTOR * convertFrequency(MID_CHANNEL_WIDTH_HZ, 'Hz', 'kHz');
      }
      const { value, unit } = observation.bandwidth;
      return value === null || unit === null
        ? null
        : getLowSpectralAveragingFactor(convertFrequency(value, unit, 'kHz'), dataProduct) *
            LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ;
    }
  }
};

/**
 * The sensitivity should always be calculated based on the images data product.
 * Fall back to the linked (selected) data product if no images one is available.
 * TODO: revisit once the PDM's result_details model is corrected.
 */
export const getSensitivityDataProduct = (
  observationId: string,
  linkedId: string,
  dataProducts: DataProductInput[]
): DataProductInput | undefined => {
  const linked = dataProducts.find((dp) => dp.id === linkedId);
  if (!linked || linked.kind !== DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES) {
    return linked;
  }
  const images = dataProducts.find(
    (dp) => dp.observationId === observationId && isImageDataProduct(dp)
  );
  return images ?? linked;
};

/**
 * Builds the calculator request for one target, valid observation and data product.
 *
 * Returns null when the calculator doesn't apply: SSO targets and the PST observing mode. A
 * continuum and spectral line observation is calculated as continuum.
 */
export const buildSensitivityRequest = (
  observation: ObservationValues,
  target: TargetType,
  dataProduct: DataProductInput
): SensitivityRequest | null => {
  if (
    target.kind === REFERENCE_COORDINATE_TYPE_SSO.value ||
    observation.observingMode === OBSERVING_MODE.PST
  ) {
    return null;
  }
  if (observation.observingMode === OBSERVING_MODE.SPECTRAL) {
    return observation.telescope === TELESCOPE.LOW
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
  }
  return observation.telescope === TELESCOPE.LOW
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
};

/**
 * Sends a request built by buildSensitivityRequest. Calculator errors and canceled requests are
 * returned as errors; a successful response in an unexpected shape can throw.
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
