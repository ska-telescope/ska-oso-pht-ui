import type { ImageDataProduct, ObservingMode, Observation } from '../../types';

// The observation and data product an SV proposal gets for each observing mode, when it's
// created or its observing mode is changed. Written as the editor shows them.

const IMAGE_DP_DEFAULTS: Omit<ImageDataProduct, 'channelsOut'> = {
  imageSize: { value: '2.2', unit: 'degree' },
  pixelSize: { value: '1.3', unit: 'arcsec' },
  weighting: 'Briggs',
  robust: '0',
  polarisations: ['I']
};

const SPECTRAL_CHANNELS = '4000';

// PST defaults to pulsar timing, whose data product has no fields to show
export const SV_DEFAULTS: Record<
  ObservingMode,
  { observation: Observation; dataProduct?: ImageDataProduct }
> = {
  Continuum: {
    observation: { centralFrequency: '199.609375', bandwidth: '150', integrationTime: '1' },
    dataProduct: { ...IMAGE_DP_DEFAULTS, channelsOut: '10' }
  },
  'Continuum-Spectral': {
    observation: { centralFrequency: '199.609375', bandwidth: '150', integrationTime: '1' },
    dataProduct: { ...IMAGE_DP_DEFAULTS, channelsOut: '4000' }
  },
  Spectral: {
    observation: {
      centralFrequency: '200',
      numberOfChannels: SPECTRAL_CHANNELS,
      spectralResolution: '1808.45 Hz (2.7 km/s)',
      integrationTime: '1'
    },
    // Shown from the observation's number of channels
    dataProduct: {
      ...IMAGE_DP_DEFAULTS,
      channelsOut: SPECTRAL_CHANNELS,
      continuumSubtraction: true
    }
  },
  PST: {
    observation: {
      centralFrequency: '199.609375',
      bandwidth: '150',
      pstMode: 'Pulsar Timing',
      integrationTime: '1'
    }
  }
};
