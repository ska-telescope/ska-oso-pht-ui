import { DataProductSDP } from '@utils/types/dataProduct.tsx';
import { IW_UNIFORM } from '@utils/constants.ts';

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
  dataProductType: 2,
  observationId: 'obs-123',
  timeAveraging: 3.4,
  frequencyAveraging: 21.7 // TODO check frequency averaging factor for pst
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
  polarisations: ['XX'], // TODO change polarisations to 'X' when pdm updated
  channelsOut: 40,
  taperValue: 0,
  bitDepth: 1
};

export const DEFAULT_PST_VISIBILITIES_DATA_PRODUCT: DataProductSDP = {
  id: 'SDP-0000000',
  dataProductType: 2,
  observationId: 'obs-123',
  polarisations: ['XX'], // TODO change polarisations to 'X' when pdm updated
  timeAveraging: 3.4,
  frequencyAveraging: 21.7, // TODO check frequency averaging factor for pst
  bitDepth: 1
};
