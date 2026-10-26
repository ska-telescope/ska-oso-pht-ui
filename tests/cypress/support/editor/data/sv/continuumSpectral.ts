import { DESCRIPTION, PKS_1830_211 } from './shared';
import type { ProposalFixture } from '../../types';

export const buildSvContinuumSpectralProposal = (): ProposalFixture => ({
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
    }
  },

  calibration: {
    calibrator: 'Hercules A',
    comment:
      'Could a second bandpass scan be added after the target?'
  }
});
