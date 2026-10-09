import { DESCRIPTION } from './shared';

export const buildSvPstProposal = () => ({
  title: `Cypress SV PST ${Date.now()}`,

  details: {
    observingMode: 'PST',
    abstract: 'PST of the pulsar variety.'
  },

  description: DESCRIPTION,

  target: {
    name: 'PSR J0523-7125',
    coordinateType: 'ICRS',
    ra: '05:23:48.6600',
    dec: '-71:25:52.600',
    velocityType: 'Velocity',
    velocity: { value: '0', unit: 'km/s' }
  },

  observation: {
    centralFrequency: '179.296875', // MHz
    bandwidth: '150', // MHz
    pstMode: 'Detected Filterbank',
    integrationTime: '1' // h
  },

  // PST has a single data product and no visibilities
  dataProducts: {
    pst: {
      polarisations: ['I'],
      // Shown in kHz and ms: a multiplier of 1 for both
      outputFrequencyResolution: '3.62',
      outputSamplingInterval: '0.207',
      bitDepth: '8',
      dispersionMeasure: '0', // pc/cm³
      rotationMeasure: '0' // rad/m²
    }
  },

  calibration: {
    calibrator: 'Pictor A',
    comment: 'Blah, blah, blah.'
  }
});
