import { DESCRIPTION } from './shared';
import type { ProposalFixture } from '../../types';

export const buildSvSpectralProposal = (): ProposalFixture => ({
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
    spectralResolution: '226.06 Hz (338.8 m/s)',
    integrationTime: '1' // h
  },

  dataProducts: {
    image: {
      imageSize: { value: '2.2', unit: 'degree' },
      pixelSize: { value: '1.3', unit: 'arcsec' },
      weighting: 'Briggs',
      robust: '0',
      polarisations: ['I'],
      // Shown from the observation's number of channels
      channelsOut: '2000',
      continuumSubtraction: true
    }
  },

  calibration: {
    calibrator: 'Centaurus A',
    comment:
      'Please keep the bandpass solutions at full channel resolution. Smoothing them across ' +
      'channels could hide narrow absorption features.'
  }
});
