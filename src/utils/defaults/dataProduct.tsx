import { DataProductSDP } from '@utils/types/dataProduct.tsx';
import { IW_UNIFORM } from '@utls/constants.ts';

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

export const DEFAULT_CONTINUUM_IMAGES_DATA_PRODUCT: DataProductSDP = {
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

export const DEFAULT_CONTINUUM_VISIBILITIES_DATA_PRODUCT: DataProductSDP = {
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
