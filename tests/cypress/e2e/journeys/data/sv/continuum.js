import { DESCRIPTION, PKS_1830_211 } from './shared';

export const buildSvContinuumProposal = () => ({
  title: `Cypress SV continuum ${Date.now()}`,

  details: {
    observingMode: 'Continuum',
    abstract: 'Lekker.'
  },

  description: DESCRIPTION,

  target: PKS_1830_211,

  observation: {
    centralFrequency: '199.609375', // MHz
    bandwidth: '150', // MHz
    integrationTime: '1' // h
  },

  // For continuum, images and visibilities are alternatives, and the journey configures images
  dataProducts: {
    image: {
      imageSize: { value: '4.5', unit: 'degree' },
      pixelSize: { value: '1.3', unit: 'arcsec' },
      weighting: 'Briggs',
      robust: '1.3456',
      polarisations: ['I'],
      channelsOut: '13'
    }
  },

  // The calibration strategy is observatory defined, so only the comment can be edited
  calibration: {
    calibrator: 'Hercules A',
    comment: ''
  }
});
