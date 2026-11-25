import {
  BAND_LOW_STR,
  DEFAULT_USER,
  PROPOSAL_STATUS,
  SA_AA2,
  TYPE_CONTINUUM,
  TYPE_ZOOM
} from '@utils/constants.ts';
import { REFERENCE_COORDINATE_TYPE_ICRS } from '@utils/constants.ts';
import Proposal from '@utils/types/proposal.tsx';
import { DATA_PRODUCT_KIND } from '@/models/proposals/dataProducts';

export const MockProposalFrontend: Proposal = {
  metadata: {
    version: 10,
    created_by: DEFAULT_USER,
    created_on: '2025-06-13T13:48:34.963103Z',
    last_modified_by: DEFAULT_USER,
    last_modified_on: '2025-06-24T16:48:47.127032Z',
    pdm_version: '18.1.0'
  },
  id: 'prsl-t0001-20250613-00002',
  title: 'New Proposal test2',
  proposalType: 'standard_proposal',
  proposalSubType: ['coordinated_proposal'],
  status: PROPOSAL_STATUS.DRAFT,
  lastUpdated: '2025-06-24T16:48:47.127032Z',
  lastUpdatedBy: DEFAULT_USER,
  createdOn: '2025-06-13T13:48:34.963103Z',
  createdBy: DEFAULT_USER,
  version: 10,
  cycle: 'SKA_1962_2024',
  investigators: [],
  abstract: 'My scienceTest abstract',
  scienceCategory: 1,
  scienceSubCategory: [1],
  sciencePDF: null,
  scienceLoadStatus: 9,
  targetOption: 1,
  targets: [
    {
      kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
      epoch: 2000,
      decStr: '00:00:00.0',
      id: 'target-123',
      name: 'target1',
      b: undefined,
      l: undefined,
      raStr: '00:00:00.0',
      redshift: '0',
      referenceFrame: 'LSRK',
      velocityDefinition: 'RADIO',
      velType: 1,
      vel: '0',
      velUnit: 0
    },
    {
      kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
      epoch: 2000,
      decStr: '+22:00:53.000',
      id: 'target-456',
      name: 'target2',
      b: undefined,
      l: undefined,
      raStr: '05:34:30.900',
      redshift: '0',
      referenceFrame: 'LSRK',
      velocityDefinition: 'RADIO',
      velType: 1,
      vel: '0',
      velUnit: 0
    },
    {
      kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
      epoch: 2000,
      decStr: '-00:49:23.700',
      id: 'target-789',
      name: 'M2',
      b: undefined,
      l: undefined,
      raStr: '21:33:27.0200',
      redshift: '0',
      referenceFrame: 'LSRK',
      velocityDefinition: 'RADIO',
      velType: 1,
      vel: '0',
      velUnit: 0
    }
  ],
  observations: [
    {
      id: 'obs-obR1Ej',
      telescope: 2,
      subarray: SA_AA2,
      type: TYPE_CONTINUUM,
      observingBand: BAND_LOW_STR,
      centralFrequency: 200,
      centralFrequencyUnits: 2,
      elevation: 20,
      numSubBands: 1,
      supplied: {
        type: 1,
        value: 1,
        units: 2
      },
      spectralResolution: '5.43 kHz (8.1 km/s)',
      effectiveResolution: '5.43 kHz (8.1 km/s)',
      bandwidth: null,
      weather: undefined,
      continuumBandwidth: 150,
      continuumBandwidthUnits: 2,
      numStations: 68,
      num13mAntennas: undefined,
      num15mAntennas: undefined
    }
  ],
  groupObservations: [],
  targetObservation: [
    {
      targetId: 'target-123',
      observationId: 'obs-obR1Ej',
      dataProductsSDPId: 'SDP-2',
      sensitivity: {
        state: 'done',
        continuum: {
          weightedSensitivity: { value: 107.53904853211655, unit: 'μJy/beam' },
          confusionNoise: { value: 1.0183425082744668, unit: 'μJy/beam' },
          totalSensitivity: { value: 107.54387002826836, unit: 'μJy/beam' },
          synthesizedBeamSize: { value: '3.85 x 3.02', unit: 'arcsec²' },
          surfaceBrightnessSensitivity: { value: 282.72036408677496, unit: 'K' }
        },
        spectral: {
          weightedSensitivity: { value: 18.72201668513227, unit: 'mJy/beam' },
          confusionNoise: { value: 3.52582756374021, unit: 'μJy/beam' },
          totalSensitivity: { value: 18.72201701713336, unit: 'mJy/beam' },
          synthesizedBeamSize: { value: '5.84 x 5.02', unit: 'arcsec²' },
          surfaceBrightnessSensitivity: { value: 19489.22259007647, unit: 'K' }
        }
      }
    }
  ],
  technicalPDF: null,
  technicalLoadStatus: 9,
  dataProducts: [
    {
      id: 'SDP-2',
      observationId: 'obs-obR1Ej',
      kind: DATA_PRODUCT_KIND.CONTINUUM_IMAGE,
      imageSize: { value: 15, unit: 'deg' },
      pixelSize: { value: 1.007, unit: 'arcsec' },
      weighting: { type: 'uniform' },
      taper: 1,
      polarisations: ['I'],
      channelsOut: 1
    }
  ],
  calibrationStrategy: [
    {
      observatoryDefined: true,
      id: 'cal-001',
      observationIdRef: 'obs-obR1Ej',
      calibrators: null,
      notes: 'This is an observatory defined calibration strategy.'
    }
  ],
  pipeline: ''
};

export const MockProposalFrontendZoom: Proposal = {
  metadata: {
    version: 5,
    created_by: DEFAULT_USER,
    created_on: '2025-06-24T22:33:30.487950Z',
    last_modified_by: DEFAULT_USER,
    last_modified_on: '2025-06-24T22:35:19.489320Z',
    pdm_version: '18.1.0'
  },
  id: 'prsl-t0001-20250624-00049',
  title: 'Proposal Zoom',
  proposalType: 'key_science_proposal',
  proposalSubType: [],
  status: PROPOSAL_STATUS.DRAFT,
  lastUpdated: '2025-06-24T22:35:19.489320Z',
  lastUpdatedBy: DEFAULT_USER,
  createdOn: '2025-06-24T22:33:30.487950Z',
  createdBy: DEFAULT_USER,
  version: 5,
  cycle: 'SKA_1962_2024',
  investigators: [],
  abstract: 'My zoom abstract.',
  scienceCategory: 7,
  scienceSubCategory: [1],
  scienceLoadStatus: 9,
  sciencePDF: null,
  technicalPDF: null,
  targetOption: 1,
  targets: [
    {
      kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
      epoch: 2000,
      decStr: '-00:49:23.700',
      id: 'target-123',
      name: 'target1',
      b: undefined,
      l: undefined,
      raStr: '21:33:27.0200',
      redshift: '0',
      referenceFrame: 'LSRK',
      velocityDefinition: 'RADIO',
      velType: 1,
      vel: '-3.6',
      velUnit: 0
    }
  ],
  observations: [
    {
      id: 'obs-arMIoY',
      telescope: 2,
      subarray: SA_AA2,
      type: TYPE_ZOOM,
      observingBand: BAND_LOW_STR,
      centralFrequency: 200,
      centralFrequencyUnits: 2,
      elevation: 20,
      numSubBands: 1,
      bandwidth: 1,
      continuumBandwidth: 150,
      continuumBandwidthUnits: 2,
      supplied: {
        type: 1,
        value: 1,
        units: 2
      },
      weather: undefined,
      spectralResolution: '14.13 Hz (21.2 m/s)',
      effectiveResolution: '14.13 Hz (21.2 m/s)',
      numStations: 68,
      num13mAntennas: undefined,
      num15mAntennas: undefined,
      zoomChannels: 1024
    }
  ],
  groupObservations: [],
  targetObservation: [
    {
      targetId: 'target-123',
      observationId: 'obs-arMIoY',
      dataProductsSDPId: 'SDP-1',
      sensitivity: {
        state: 'done',
        spectral: {
          weightedSensitivity: { value: 29.69626339640881, unit: 'mJy/beam' },
          confusionNoise: { value: 22.18293905542935, unit: 'μJy/beam' },
          totalSensitivity: { value: 29.696271681672012, unit: 'mJy/beam' },
          synthesizedBeamSize: { value: '13.47 x 11.10', unit: 'arcsec²' },
          surfaceBrightnessSensitivity: { value: 6071.553983562558, unit: 'K' }
        }
      }
    }
  ],
  technicalLoadStatus: 9,
  dataProducts: [
    {
      id: 'SDP-1',
      observationId: 'obs-arMIoY',
      kind: DATA_PRODUCT_KIND.SPECTRAL_IMAGE,
      imageSize: { value: 100, unit: 'deg' },
      pixelSize: { value: 3.7, unit: 'arcsec' },
      weighting: { type: 'briggs', robust: 0.5 },
      taper: 1,
      polarisations: ['I'],
      channelsOut: 2,
      continuumSubtraction: false
    }
  ],
  calibrationStrategy: [
    {
      observatoryDefined: true,
      id: 'cal-002',
      observationIdRef: 'obs-arMIoY',
      calibrators: null,
      notes: 'This is an other observatory defined calibration strategy.'
    }
  ],
  pipeline: ''
};
