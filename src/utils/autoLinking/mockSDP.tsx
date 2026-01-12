import {
  DP_TYPE_IMAGES,
  FLOW_THROUGH_VALUE,
  IW_UNIFORM,
  ROBUST_DEFAULT,
  TAPER_DEFAULT
} from '../constants';
import {
  DataProductSDPNew,
  SDPFlowthroughPSTData,
  SDPImageContinuumData,
  SDPSpectralData
} from '../types/dataProduct';

export const PST_FLOW_THROUGH_DATA_PRODUCT: DataProductSDPNew = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  data: {
    dataProductType: FLOW_THROUGH_VALUE,
    polarisations: ['X'],
    bitDepth: 1
  } as SDPFlowthroughPSTData
};

export const CONTINUUM_IMAGE_DATA_PRODUCT: DataProductSDPNew = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  data: {
    dataProductType: DP_TYPE_IMAGES,
    imageSizeValue: 2.5,
    imageSizeUnits: 0,
    pixelSizeValue: 1.6,
    pixelSizeUnits: 2,
    weighting: IW_UNIFORM,
    polarisations: ['I', 'XX'],
    channelsOut: 10,
    robust: ROBUST_DEFAULT,
    taperValue: TAPER_DEFAULT
  } as SDPImageContinuumData
};

export const SPECTRAL_DATA_PRODUCT: DataProductSDPNew = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  data: {
    imageSizeValue: 2.5,
    imageSizeUnits: 0,
    pixelSizeValue: 1.6,
    pixelSizeUnits: 2,
    weighting: IW_UNIFORM,
    polarisations: ['I', 'XX'],
    channelsOut: 40,
    robust: ROBUST_DEFAULT,
    taperValue: TAPER_DEFAULT,
    continuumSubtraction: true
  } as SDPSpectralData
};
