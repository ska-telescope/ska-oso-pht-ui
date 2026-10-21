import { DESCRIPTION, PKS_1830_211 } from './shared';
import type { ProposalFixture } from '../../types';

export const buildSvContinuumProposal = (): ProposalFixture => ({
  title: `Cypress SV continuum ${Date.now()}`,

  details: {
    observingMode: 'Continuum',
    abstract: 'Lekker.'
  },

  description: DESCRIPTION,

  target: PKS_1830_211,

  observation: {
    centralFrequency: '194.921875', // MHz
    bandwidth: '118.75', // MHz
    integrationTime: '1.45' // h
  },

  // For continuum, images and visibilities are alternatives, and the journey configures images
  dataProducts: {
    image: {
      imageSize: { value: '4.5', unit: 'degree' },
      pixelSize: { value: '1.4', unit: 'arcsec' },
      weighting: 'Briggs',
      robust: '1.3456',
      polarisations: ['Q', 'U'],
      channelsOut: '13'
    }
  },

  // The calibration strategy is observatory defined, so only the comment can be edited
  calibration: {
    calibrator: 'Hercules A',
    comment:
      'Hercules A transits roughly 2 h before PKS 1830-211, so a calibrator scan after the ' +
      'target would also help. PKS 1830-211 is bright and compact, so we plan phase-only ' +
      'self-calibration after transferring the bandpass.'
  }
});
