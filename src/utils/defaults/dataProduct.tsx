import { DataProductSDP } from '@utils/types/dataProduct.tsx';
import { IW_UNIFORM } from '@utils/constants.ts';

export const DEFAULT_DATA_PRODUCT: DataProductSDP = {
  id: 'SDP-0000000',
  dataProductType: 1, // used for continuum and pst
  observationId: 'obs-123',
  imageSizeValue: 2.5, // used for continuum and spectral
  imageSizeUnits: 0, // used for continuum and spectral
  pixelSizeValue: 1.6, // used for continuum and spectral
  pixelSizeUnits: 2, // used for continuum and spectral
  weighting: IW_UNIFORM, // used for continuum and spectral
  polarisations: ['I', 'XX'], // used for all modes
  channelsOut: 40, // used for spectral
  fitSpectralPol: 3, // TODO used for pst timing data product?
  robust: 1, // used for continuum and spectral
  taperValue: 0, // used for continuum and spectral
  timeAveraging: 3.4, // used for continuum and pst
  frequencyAveraging: 21.7, // used for continuum // TODO check frequency averaging factor for pst
  bitDepth: 1, // used for pst
  continuumSubtraction: false // used for spectral
};

export const DEFAULT_SPECTRAL_DATA_PRODUCT: DataProductSDP = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  imageSizeValue: 2.5,
  imageSizeUnits: 0,
  pixelSizeValue: 1.6,
  pixelSizeUnits: 2,
  weighting: IW_UNIFORM,
  polarisations: ['I', 'XX'],
  channelsOut: 40,
  taperValue: 0,
  continuumSubtraction: false
};

export const DEFAULT_CONTINUUM_IMAGES_DATA_PRODUCT: DataProductSDP = {
  id: 'SDP-0000000',
  dataProductType: 1,
  observationId: 'obs-123',
  imageSizeValue: 2.5,
  imageSizeUnits: 0,
  pixelSizeValue: 1.6,
  pixelSizeUnits: 2,
  weighting: IW_UNIFORM,
  polarisations: ['I', 'XX'],
  taperValue: 0,
  channelsOut: 40 // TODO Check as previously noted only for spectral
};

export const DEFAULT_CONTINUUM_VISIBILITIES_DATA_PRODUCT: DataProductSDP = {
  id: 'SDP-0000000',
  dataProductType: 1, ///TODO: Check if needed
  observationId: 'obs-123',
  timeAveraging: 3.4,
  frequencyAveraging: 21.7
};

export const DEFAULT_PST_IMAGES_DATA_PRODUCT: DataProductSDP = {
  id: 'SDP-0000000',
  dataProductType: 1,
  observationId: 'obs-123',
  imageSizeValue: 2.5,
  imageSizeUnits: 0,
  pixelSizeValue: 1.6,
  pixelSizeUnits: 2,
  weighting: IW_UNIFORM,
  polarisations: ['I', 'XX'],
  channelsOut: 40,
  taperValue: 0,
  bitDepth: 1
};

export const DEFAULT_PST_VISIBILITIES_DATA_PRODUCT: DataProductSDP = {
  id: 'SDP-0000000',
  dataProductType: 1,
  observationId: 'obs-123',
  polarisations: ['I', 'XX'],
  timeAveraging: 3.4,
  frequencyAveraging: 21.7,
  bitDepth: 1
};
