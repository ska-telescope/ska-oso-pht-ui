import { DESCRIPTION, PKS_1830_211 } from './shared';

export const buildSvContinuumSpectralProposal = () => ({
  title: `Cypress SV continuum-spectral ${Date.now()}`,

  details: {
    observingMode: 'Continuum-Spectral',
    abstract: 'asdgfasdgf'
  },

  description: DESCRIPTION,

  target: PKS_1830_211,

  observation: {
    centralFrequency: '199.609375', // MHz
    bandwidth: '150', // MHz
    integrationTime: '1' // h
  },

  dataProducts: {
    image: {
      imageSize: { value: '2.2', unit: 'degree' },
      pixelSize: { value: '1.3', unit: 'arcsec' },
      weighting: 'Briggs',
      robust: '0',
      polarisations: ['I'],
      channelsOut: '2'
    },
    visibilities: {
      // Shown in seconds and kHz: multipliers of 4 and 1
      timeAveraging: '3.397',
      frequencyAveraging: '5.43'
    }
  },

  calibration: {
    calibrator: 'Hercules A',
    comment: ''
  }
});
