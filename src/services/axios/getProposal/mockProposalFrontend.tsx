import Proposal from '@/utils/types/proposal';

const MockProposalFrontend: Proposal = {
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
  sciencePDF: undefined,
  scienceLoadStatus: 9,
  targetOption: 1,
  targets: [
    {
      dec: '00:00:00.0',
      decUnit: 'deg',
      id: 1,
      name: 'target',
      latitude: '',
      longitude: '',
      ra: '00:00:00.0',
      raUnit: 'hourangle',
      redshift: '0',
      referenceFrame: 0,
      rcReferenceFrame: 'icrs',
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
      dec: '+22:00:53.000',
      decUnit: 'deg',
      id: 2,
      name: 'target2',
      latitude: '',
      longitude: '',
      ra: '05:34:30.900',
      raUnit: 'hourangle',
      redshift: '0',
      referenceFrame: 0,
      rcReferenceFrame: 'icrs',
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
      dec: '-00:49:23.700',
      decUnit: 'deg',
      id: 3,
      name: 'M2',
      latitude: '',
      longitude: '',
      ra: '21:33:27.0200',
      raUnit: 'hourangle',
      redshift: '0',
      referenceFrame: 0,
      rcReferenceFrame: 'icrs',
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
      bandwidth: undefined,
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
  technicalPDF: undefined,
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

export default MockProposalFrontend;
