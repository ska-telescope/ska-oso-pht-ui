import Observation from '@utils/types/observation';
import {
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  PULSAR_TIMING_VALUE,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST,
  TYPE_ZOOM
} from '@utils/constants';
import type { ContinuumImage, DataProductSDP } from '@/generated/models';

// One data product of every script variant, as the backend sends them
const image: Pick<
  ContinuumImage,
  'image_size' | 'image_cellsize' | 'weight' | 'polarisations' | 'gaussian_taper'
> = {
  image_size: { value: 2.2, unit: 'deg' },
  image_cellsize: { value: 1.3, unit: 'arcsec' },
  weight: { weighting: 'briggs', robust: 0.5 },
  polarisations: ['I', 'XX'],
  gaussian_taper: 0
};

export const pdmDataProducts: DataProductSDP[] = [
  {
    data_product_id: 'dp-continuum-image',
    observation_set_ref: 'obs-continuum',
    script_parameters: {
      ...image,
      channels_out: 1,
      kind: 'continuum',
      variant: 'continuum image'
    }
  },
  {
    data_product_id: 'dp-continuum-visibilities',
    observation_set_ref: 'obs-continuum',
    script_parameters: {
      time_averaging: 2,
      frequency_averaging: 3,
      kind: 'continuum',
      variant: 'visibilities'
    }
  },
  {
    data_product_id: 'dp-spectral-image',
    observation_set_ref: 'obs-spectral',
    script_parameters: {
      ...image,
      weight: { weighting: 'uniform' },
      channels_out: 40,
      continuum_subtraction: true,
      kind: 'spectral',
      variant: 'spectral image'
    }
  },
  {
    data_product_id: 'dp-continuum-spectral-image',
    observation_set_ref: 'obs-continuum-spectral',
    script_parameters: {
      ...image,
      channels_out: 4000,
      kind: 'continuum and spectral line',
      variant: 'continuum and spectral line image'
    }
  },
  {
    data_product_id: 'dp-pst-flow-through',
    observation_set_ref: 'obs-pst-flow-through',
    script_parameters: {
      polarisations: ['X', 'Y'],
      bit_depth: 16,
      kind: 'pst',
      variant: 'flow through'
    }
  },
  {
    data_product_id: 'dp-pst-detected-filterbank',
    observation_set_ref: 'obs-pst-detected-filterbank',
    script_parameters: {
      polarisations: ['I'],
      bit_depth: 8,
      output_frequency_resolution: 1,
      output_sampling_interval: 2,
      dispersion_measure: 3.5,
      rotation_measure: -4,
      kind: 'pst',
      variant: 'detected filterbank'
    }
  },
  {
    data_product_id: 'dp-pst-timing',
    observation_set_ref: 'obs-pst-timing',
    script_parameters: { kind: 'pst', variant: 'pulsar timing' }
  }
];

// The legacy save picks a data product's script variant from its observation's type and PST mode
export const legacyObservations = [
  { id: 'obs-continuum', type: TYPE_CONTINUUM },
  { id: 'obs-spectral', type: TYPE_ZOOM },
  { id: 'obs-continuum-spectral', type: TYPE_CONTINUUM_SPECTRAL },
  { id: 'obs-pst-flow-through', type: TYPE_PST, pstMode: FLOW_THROUGH_VALUE },
  { id: 'obs-pst-detected-filterbank', type: TYPE_PST, pstMode: DETECTED_FILTER_BANK_VALUE },
  { id: 'obs-pst-timing', type: TYPE_PST, pstMode: PULSAR_TIMING_VALUE }
] as Observation[];
