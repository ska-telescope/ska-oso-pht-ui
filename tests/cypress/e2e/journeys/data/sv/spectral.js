import { DESCRIPTION } from './shared';

export const buildSvSpectralProposal = () => ({
  title: `Cypress SV spectral ${Date.now()}`,

  details: {
    observingMode: 'Spectral',
    abstract: "Observe a spectral line. I really don't care which one."
  },

  description: DESCRIPTION,

  target: {
    name: 'Cen A',
    coordinateType: 'ICRS',
    ra: '13:25:27.6152',
    dec: '-43:01:08.805',
    velocityType: 'Redshift',
    redshift: '0.00187695'
  },

  // The bandwidth isn't entered: it follows from the number of channels and the spectral
  // resolution (2000 x 226.06 Hz = 0.45212 MHz)
  observation: {
    centralFrequency: '200', // MHz
    numberOfChannels: '2000',
    spectralResolution: '226.06 Hz (338.9 m/s)',
    integrationTime: '1' // h
  },

  dataProducts: {
    image: {
      imageSize: { value: '2.2', unit: 'degree' },
      pixelSize: { value: '1.3', unit: 'arcsec' },
      weighting: 'Briggs',
      robust: '0',
      polarisations: ['I'],
      channelsOut: '10',
      continuumSubtraction: true
    },
    visibilities: {
      // Shown in seconds and kHz: multipliers of 4 and 1
      timeAveraging: '3.397',
      frequencyAveraging: '5.43'
    }
  },

  calibration: {
    calibrator: 'Centaurus A',
    comment: ''
  }
});
