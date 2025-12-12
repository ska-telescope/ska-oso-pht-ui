import { IW_UNIFORM } from '../constants';
import { DataProductSDP } from '../types/dataProduct';

export const PST_DATA_PRODUCT: DataProductSDP = {
  id: 'SDP-0000000',
  dataProductType: 1,
  observationId: 'obs-123',
  imageSizeValue: 2.5,
  imageSizeUnits: 0,
  pixelSizeValue: 1.6,
  pixelSizeUnits: 2,
  weighting: IW_UNIFORM,
  polarisations: ['X'],
  channelsOut: 40,
  fitSpectralPol: 3,
  robust: 1,
  taperValue: 0,
  timeAveraging: 3.4,
  frequencyAveraging: 21.7,
  bitDepth: 1,
  continuumSubtraction: false
};
