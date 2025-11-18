import { DEFAULT_USER, PROPOSAL_STATUS } from '@utils/constants.ts';
import { RA_TYPE_ICRS } from '@utils/constants.ts';
import Proposal from '@utils/types/proposal.tsx';

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
  proposalType: 1,
  proposalSubType: [3],
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
      kind: RA_TYPE_ICRS.value,
      epoch: 2000,
      decStr: '00:00:00.0',
      id: 1,
      name: 'target',
      b: undefined,
      l: undefined,
      raStr: '00:00:00.0',
      redshift: '0',
      referenceFrame: RA_TYPE_ICRS.label,
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
      },
      tiedArrayBeams: {
        pstBeams: [
          {
            beamName: 'beam1',
            id: 1,
            beamCoordinate: {
              raStr: '21:33:27.0200',
              decStr: '-00:49:23.700',
              kind: RA_TYPE_ICRS.label,
              pmRa: 4.8,
              pmDec: -3.3,
              parallax: 0.0,
              epoch: 2000.0
            },
            stnWeights: []
          }
        ],
        pssBeams: [],
        vlbiBeams: []
      }
    },
    {
      kind: RA_TYPE_ICRS.value,
      epoch: 2000,
      decStr: '+22:00:53.000',
      id: 2,
      name: 'target2',
      b: undefined,
      l: undefined,
      raStr: '05:34:30.900',
      redshift: '0',
      referenceFrame: RA_TYPE_ICRS.label,
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
      },
      tiedArrayBeams: {
        pstBeams: [
          {
            beamName: 'beam1',
            id: 1,
            beamCoordinate: {
              raStr: '21:33:27.0200',
              decStr: '-00:49:23.700',
              kind: RA_TYPE_ICRS.label,
              pmRa: 4.8,
              pmDec: -3.3,
              parallax: 0.0,
              epoch: 2000.0
            },
            stnWeights: []
          }
        ],
        pssBeams: [],
        vlbiBeams: []
      }
    },
    {
      kind: RA_TYPE_ICRS.value,
      epoch: 2000,
      decStr: '-00:49:23.700',
      id: 3,
      name: 'M2',
      b: undefined,
      l: undefined,
      raStr: '21:33:27.0200',
      redshift: '0',
      referenceFrame: RA_TYPE_ICRS.label,
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
      },
      tiedArrayBeams: {
        pstBeams: [
          {
            beamName: 'beam1',
            id: 1,
            beamCoordinate: {
              raStr: '21:33:27.0200',
              decStr: '-00:49:23.700',
              kind: RA_TYPE_ICRS.label,
              pmRa: 4.8,
              pmDec: -3.3,
              parallax: 0.0,
              epoch: 2000.0
            },
            stnWeights: []
          }
        ],
        pssBeams: [],
        vlbiBeams: []
      }
    }
  ],
  observations: [
    {
      id: 'obs-obR1Ej',
      telescope: 2,
      subarray: 3,
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
      continuumBandwidth: 150,
      continuumBandwidthUnits: 2,
      numStations: 68,
      num13mAntennas: undefined,
      num15mAntennas: undefined,
      zoomChannels: null,
      pstMode: null
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
            units: 'μJy/beam'
          },
          {
            field: 'continuumConfusionNoise',
            value: '1.0183425082744668',
            units: 'μJy/beam'
          },
          {
            field: 'continuumTotalSensitivity',
            value: '107.54387002826836',
            units: 'μJy/beam'
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
            units: 'μJy/beam'
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
      pixelSizeUnits: 2,
      weighting: '1',
      polarisations: ['I'],
      channelsOut: 1,
      fitSpectralPol: 3,
      robust: 0
    }
  ],
  dataProductSRC: [],
  calibrationStrategy: [
    {
      observatoryDefined: true,
      id: 'cal-001',
      observationIdRef: 'obs-obR1Ej',
      calibrators: null,
      notes: 'This is an observatory defined calibration strategy.',
      isAddNote: true
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
  proposalType: 2,
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
      kind: RA_TYPE_ICRS.value,
      epoch: 2000,
      decStr: '-00:49:23.700',
      id: 1,
      name: 'm2',
      b: undefined,
      l: undefined,
      raStr: '21:33:27.0200',
      redshift: '0',
      referenceFrame: RA_TYPE_ICRS.label,
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
      },
      tiedArrayBeams: {
        pstBeams: [
          {
            beamName: 'beam1',
            id: 1,
            beamCoordinate: {
              raStr: '21:33:27.0200',
              decStr: '-00:49:23.700',
              kind: RA_TYPE_ICRS.label,
              pmRa: 4.8,
              pmDec: -3.3,
              parallax: 0.0,
              epoch: 2000.0
            },
            stnWeights: []
          }
        ],
        pssBeams: [],
        vlbiBeams: []
      }
    }
  ],
  observations: [
    {
      id: 'obs-arMIoY',
      telescope: 2,
      subarray: 3,
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
      robust: 1,
      tapering: undefined,
      weather: undefined,
      spectralResolution: '14.13 Hz (21.2 m/s)',
      effectiveResolution: '14.13 Hz (21.2 m/s)',
      spectralAveraging: 1,
      linked: 'm2',
      numStations: 68,
      num13mAntennas: undefined,
      num15mAntennas: undefined,
      zoomChannels: 1024,
      pstMode: null
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
            units: 'μJy/beam'
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
      pixelSizeUnits: 2,
      weighting: '2',
      polarisations: ['I'],
      robust: 2,
      channelsOut: 1,
      fitSpectralPol: 3
    }
  ],
  dataProductSRC: [],
  calibrationStrategy: [
    {
      observatoryDefined: true,
      id: 'cal-002',
      observationIdRef: 'obs-arMIoY',
      calibrators: null,
      notes: 'This is an other observatory defined calibration strategy.',
      isAddNote: true
    }
  ],
  pipeline: ''
};
