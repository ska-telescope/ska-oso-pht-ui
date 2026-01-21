import {
  DP_TYPE_IMAGES,
  IW_UNIFORM,
  PULSAR_TIMING_VALUE,
  ROBUST_DEFAULT,
  TAPER_DEFAULT
} from '../constants';
import {
  DataProductSDPNew,
  SDPImageContinuumData,
  SDPSpectralData,
  SDPTimingPSTData
} from '../types/dataProduct';

export const PST_TIMING_DATA_PRODUCT: DataProductSDPNew = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  data: {
    dataProductType: PULSAR_TIMING_VALUE
  } as SDPTimingPSTData
};

export const CONTINUUM_IMAGE_DATA_PRODUCT: DataProductSDPNew = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  data: {
    continuumSubtraction: true,
    dataProductType: DP_TYPE_IMAGES,
    imageSizeValue: 2.5,
    imageSizeUnits: 0,
    pixelSizeValue: 1.6,
    pixelSizeUnits: 2,
    weighting: IW_UNIFORM,
    polarisations: ['I', 'XX'],
    channelsOut: 40,
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
