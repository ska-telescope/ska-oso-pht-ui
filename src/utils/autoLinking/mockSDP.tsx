import {
  CHANNELS_OUT_DEFAULT,
  DP_TYPE_IMAGES,
  IMAGE_SIZE_DEFAULT,
  IMAGE_SIZE_UNIT_DEFAULT,
  IW_UNIFORM,
  PIXEL_SIZE_DEFAULT,
  PIXEL_SIZE_UNIT_DEFAULT,
  POLARISATIONS_DEFAULT,
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
    imageSizeValue: IMAGE_SIZE_DEFAULT,
    imageSizeUnits: IMAGE_SIZE_UNIT_DEFAULT,
    pixelSizeValue: PIXEL_SIZE_DEFAULT,
    pixelSizeUnits: PIXEL_SIZE_UNIT_DEFAULT,
    weighting: IW_UNIFORM,
    polarisations: POLARISATIONS_DEFAULT,
    channelsOut: CHANNELS_OUT_DEFAULT,
    robust: ROBUST_DEFAULT,
    taperValue: TAPER_DEFAULT
  } as SDPImageContinuumData
};

export const SPECTRAL_DATA_PRODUCT: DataProductSDPNew = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  data: {
    imageSizeValue: IMAGE_SIZE_DEFAULT,
    imageSizeUnits: IMAGE_SIZE_UNIT_DEFAULT,
    pixelSizeValue: PIXEL_SIZE_DEFAULT,
    pixelSizeUnits: PIXEL_SIZE_UNIT_DEFAULT,
    weighting: IW_UNIFORM,
    polarisations: POLARISATIONS_DEFAULT,
    channelsOut: CHANNELS_OUT_DEFAULT,
    robust: ROBUST_DEFAULT,
    taperValue: TAPER_DEFAULT,
    continuumSubtraction: true
  } as SDPSpectralData
};
