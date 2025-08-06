import { ICRS } from '@/utils/constants';
import Proposal from '@/utils/types/proposal';

export const MockProposalFrontend: Proposal = {
  metadata: {
    version: 10,
    created_by: 'DefaultUser',
    created_on: '2025-06-13T13:48:34.963103Z',
    last_modified_by: 'DefaultUser',
    last_modified_on: '2025-06-24T16:48:47.127032Z',
    pdm_version: '18.1.0'
  },
  id: 'prsl-t0001-20250613-00002',
  title: 'New Proposal test2',
  proposalType: 1,
  proposalSubType: [3],
  status: 'draft',
  lastUpdated: '2025-06-24T16:48:47.127032Z',
  lastUpdatedBy: 'DefaultUser',
  createdOn: '2025-06-13T13:48:34.963103Z',
  createdBy: 'DefaultUser',
  version: 10,
  cycle: 'SKA_1962_2024',
  team: [],
  abstract: 'My scienceTest abstract',
  scienceCategory: 1,
  scienceSubCategory: [1],
  sciencePDF: null,
  scienceLoadStatus: 9,
  targetOption: 1,
  targets: [
    {
      kind: ICRS,
      epoch: 2000,
      decStr: '00:00:00.0',
      id: 1,
      name: 'target',
      b: '',
      l: '',
      parallax: undefined,
      pmDec: undefined,
      pmRa: undefined,
      raStr: '00:00:00.0',
      redshift: '0',
      referenceFrame: ICRS,
      rcReferenceFrame: ICRS, // TODO can this be removed?
      raReferenceFrame: 'LSRK',
      raDefinition: 'RADIO',
      velType: 1,
      vel: '0',
      velUnit: 0,
      pointingPattern: {
        active: 'SinglePointParameters',
        parameters: [
          {
            kind: 'SinglePointParameters',
            offsetXArcsec: 0.5,
            offsetYArcsec: 0.5
          }
        ]
      }
    },
    {
      kind: ICRS,
      epoch: 2000,
      decStr: '+22:00:53.000',
      id: 2,
      name: 'target2',
      b: '',
      l: '',
      parallax: undefined,
      pmDec: undefined,
      pmRa: undefined,
      raStr: '05:34:30.900',
      redshift: '0',
      referenceFrame: ICRS,
      rcReferenceFrame: ICRS,
      raReferenceFrame: 'LSRK',
      raDefinition: 'RADIO',
      velType: 1,
      vel: '0',
      velUnit: 0,
      pointingPattern: {
        active: 'SinglePointParameters',
        parameters: [
          {
            kind: 'SinglePointParameters',
            offsetXArcsec: 0.5,
            offsetYArcsec: 0.5
          }
        ]
      }
    },
    {
      kind: ICRS,
      epoch: 2000,
      decStr: '-00:49:23.700',
      id: 3,
      name: 'M2',
      b: '',
      l: '',
      parallax: undefined,
      pmDec: undefined,
      pmRa: undefined,
      raStr: '21:33:27.0200',
      redshift: '0',
      referenceFrame: ICRS,
      rcReferenceFrame: ICRS,
      raReferenceFrame: 'LSRK',
      raDefinition: 'RADIO',
      velType: 1,
      vel: '0',
      velUnit: 0,
      pointingPattern: {
        active: 'SinglePointParameters',
        parameters: [
          {
            kind: 'SinglePointParameters',
            offsetXArcsec: 0.5,
            offsetYArcsec: 0.5
          }
        ]
      }
    }
  ],
  observations: [
    {
      id: 'obs-obR1Ej',
      telescope: 2,
      subarray: 8,
      type: 1,
      imageWeighting: 1,
      observingBand: 0,
      centralFrequency: 200,
      centralFrequencyUnits: 2,
      elevation: 20,
      numSubBands: 1,
      supplied: {
        type: 1,
        value: 1,
        units: 2
      },
      robust: 3,
      spectralResolution: '5.43 kHz (8.1 km/s)',
      effectiveResolution: '5.43 kHz (8.1 km/s)',
      spectralAveraging: 1,
      linked: 'M2',
      bandwidth: null,
      tapering: undefined,
      weather: undefined,
      continuumBandwidth: 300,
      continuumBandwidthUnits: 2,
      numStations: 512,
      num13mAntennas: undefined,
      num15mAntennas: undefined
    }
  ],
  groupObservations: [],
  targetObservation: [
    {
      targetId: 3,
      observationId: 'obs-obR1Ej',
      sensCalc: {
        id: 1,
        title: 'M2',
        statusGUI: 0,
        error: '',
        section1: [
          {
            field: 'continuumSensitivityWeighted',
            value: '107.53904853211655',
            units: 'uJy/beam'
          },
          {
            field: 'continuumConfusionNoise',
            value: '1.0183425082744668',
            units: 'uJy/beam'
          },
          {
            field: 'continuumTotalSensitivity',
            value: '107.54387002826836',
            units: 'uJy/beam'
          },
          {
            field: 'continuumSynthBeamSize',
            value: '3.85 x 3.02',
            units: 'arcsec²'
          },
          {
            field: 'continuumSurfaceBrightnessSensitivity',
            value: '282.72036408677496',
            units: 'K'
          }
        ],
        section2: [
          {
            field: 'spectralSensitivityWeighted',
            value: '18.72201668513227',
            units: 'mJy/beam'
          },
          {
            field: 'spectralConfusionNoise',
            value: '3.52582756374021',
            units: 'uJy/beam'
          },
          {
            field: 'spectralTotalSensitivity',
            value: '18.72201701713336',
            units: 'mJy/beam'
          },
          {
            field: 'spectralSynthBeamSize',
            value: '5.84 x 5.02',
            units: 'arcsec²'
          },
          {
            field: 'spectralSurfaceBrightnessSensitivity',
            value: '19489.22259007647',
            units: 'K'
          }
        ],
        section3: [
          {
            field: 'integrationTime',
            value: '1',
            units: 'h'
          }
        ]
      }
    }
  ],
  technicalPDF: null,
  technicalLoadStatus: 9,
  dataProductSDP: [
    {
      id: 1,
      dataProductsSDPId: 'SDP-2',
      observatoryDataProduct: [true, false, true, false],
      observationId: ['obs-obR1Ej'],
      imageSizeValue: 15,
      imageSizeUnits: 0,
      pixelSizeValue: 1.007,
      pixelSizeUnits: 'arcsecs',
      weighting: 1
    }
  ],
  dataProductSRC: [],
  pipeline: ''
};

export const MockProposalFrontendZoom: Proposal = {
  metadata: {
    version: 5,
    created_by: 'DefaultUser',
    created_on: '2025-06-24T22:33:30.487950Z',
    last_modified_by: 'DefaultUser',
    last_modified_on: '2025-06-24T22:35:19.489320Z',
    pdm_version: '18.1.0'
  },
  id: 'prsl-t0001-20250624-00049',
  title: 'Proposal Zoom',
  proposalType: 2,
  proposalSubType: [],
  status: 'draft',
  lastUpdated: '2025-06-24T22:35:19.489320Z',
  lastUpdatedBy: 'DefaultUser',
  createdOn: '2025-06-24T22:33:30.487950Z',
  createdBy: 'DefaultUser',
  version: 5,
  cycle: 'SKA_1962_2024',
  team: [],
  abstract: 'My zoom abstract.',
  scienceCategory: 7,
  scienceSubCategory: [1],
  scienceLoadStatus: 9,
  sciencePDF: null,
  technicalPDF: null,
  targetOption: 1,
  targets: [
    {
      kind: ICRS,
      epoch: 2000,
      decStr: '-00:49:23.700',
      id: 1,
      name: 'm2',
      b: '',
      l: '',
      parallax: undefined,
      pmDec: undefined,
      pmRa: undefined,
      raStr: '21:33:27.0200',
      redshift: '0',
      referenceFrame: ICRS,
      rcReferenceFrame: ICRS,
      raReferenceFrame: 'LSRK',
      raDefinition: 'RADIO',
      velType: 1,
      vel: '-3.6',
      velUnit: 0,
      pointingPattern: {
        active: 'SinglePointParameters',
        parameters: [
          {
            kind: 'SinglePointParameters',
            offsetXArcsec: 0.5,
            offsetYArcsec: 0.5
          }
        ]
      }
    }
  ],
  observations: [
    {
      id: 'obs-arMIoY',
      telescope: 2,
      subarray: 8,
      type: 0,
      imageWeighting: 1,
      observingBand: 0,
      centralFrequency: 200,
      centralFrequencyUnits: 2,
      elevation: 20,
      numSubBands: 1,
      bandwidth: 1,
      continuumBandwidth: null,
      continuumBandwidthUnits: null,
      supplied: {
        type: 1,
        value: 1,
        units: 2
      },
      robust: 4,
      tapering: undefined,
      weather: undefined,
      spectralResolution: '14.13 Hz (21.2 m/s)',
      effectiveResolution: '14.13 Hz (21.2 m/s)',
      spectralAveraging: 1,
      linked: 'm2',
      numStations: 512,
      num13mAntennas: undefined,
      num15mAntennas: undefined
    }
  ],
  groupObservations: [],
  targetObservation: [
    {
      targetId: 1,
      observationId: 'obs-arMIoY',
      sensCalc: {
        id: 1,
        title: 'm2',
        statusGUI: 0,
        error: '',
        section1: [
          {
            field: 'spectralSensitivityWeighted',
            value: '29.69626339640881',
            units: 'mJy/beam'
          },
          {
            field: 'spectralConfusionNoise',
            value: '22.18293905542935',
            units: 'uJy/beam'
          },
          {
            field: 'spectralTotalSensitivity',
            value: '29.696271681672012',
            units: 'mJy/beam'
          },
          {
            field: 'spectralSynthBeamSize',
            value: '13.47 x 11.10',
            units: 'arcsec²'
          },
          {
            field: 'spectralSurfaceBrightnessSensitivity',
            value: '6071.553983562558',
            units: 'K'
          }
        ],
        section2: [],
        section3: [
          {
            field: 'integrationTime',
            value: '1',
            units: 'h'
          }
        ]
      }
    }
  ],
  technicalLoadStatus: 9,
  dataProductSDP: [
    {
      id: 1,
      dataProductsSDPId: 'SDP-1',
      observatoryDataProduct: [true, true, true, true],
      observationId: ['obs-arMIoY'],
      imageSizeValue: 100,
      imageSizeUnits: 0,
      pixelSizeValue: 3.7,
      pixelSizeUnits: 'arcsecs',
      weighting: 2
    }
  ],
  dataProductSRC: [],
  pipeline: ''
};
