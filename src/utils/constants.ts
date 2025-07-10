import { LABEL_POSITION, TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import { env } from '../env';

export const USE_LOCAL_DATA = env.REACT_APP_USE_LOCAL_DATA === 'true';
export const USE_LOCAL_DATA_SENSITIVITY_CALC =
  env.REACT_APP_USE_LOCAL_DATA_SENSITIVITY_CALC === 'true';
export const SKA_OSO_SERVICES_URL = env.REACT_APP_SKA_OSO_SERVICES_URL;
export const SKA_SENSITIVITY_CALCULATOR_API_URL = env.REACT_APP_SKA_SENSITIVITY_CALC_URL;
export const API_VERSION = '/senscalc/api/v11';
export const OSO_SERVICES_PROPOSAL_PATH = '/pht/prsls';
export const OSO_SERVICES_REVIEWS_PATH = '/pht/reviews';
export const OSO_SERVICES_REVIEWERS_PATH = '/pht/reviewers';
export const OSO_SERVICES_PANEL_PATH = '/pht/panels';
//
export const MSENTRA_CLIENT_ID = env.MSENTRA_CLIENT_ID;
export const MSENTRA_TENANT_ID = env.MSENTRA_TENANT_ID;
export const MSENTRA_REDIRECT_URI = env.MSENTRA_REDIRECT_URI;

/*****************************************/

export const BAND_LOW = 0;
export const BAND_1 = 1;
export const BAND_2 = 2;
export const BAND_5A = 3;
export const BAND_5B = 4;

export const ANTENNA_LOW = 'low'; // TODO can we find a better name for the Low Antenna?
export const ANTENNA_13M = '13m';
export const ANTENNA_15M = '15m';
export const ANTENNA_MIXED = 'mixed';

export const BANDWIDTH_TELESCOPE = [
  {
    label: 'Low (50 - 350 MHz)',
    telescope: 2,
    value: BAND_LOW,
    isBand5: false,
    units: 'MHz',
    mapping: 'low_band',
    bandLimits: {
      [ANTENNA_LOW]: [50.0, 350.0]
    }
  },
  {
    label: 'Mid Band 1 (0.35 - 1.05 GHz)',
    telescope: 1,
    value: BAND_1,
    isBand5: false,
    units: 'GHz',
    mapping: 'mid_band_1',
    bandLimits: {
      [ANTENNA_15M]: [0.35e9, 1.05e9],
      [ANTENNA_13M]: [0.58e9, 1.015e9],
      [ANTENNA_MIXED]: [0.58e9, 1.015e9]
    }
  },
  {
    label: 'Mid Band 2 (0.95 - 1.76 GHz)',
    telescope: 1,
    value: BAND_2,
    isBand5: false,
    units: 'GHz',
    mapping: 'mid_band_2',
    bandLimits: {
      [ANTENNA_15M]: [0.95e9, 1.76e9],
      [ANTENNA_13M]: [0.95e9, 1.67e9],
      [ANTENNA_MIXED]: [0.95e9, 1.67e9]
    }
  },
  {
    label: 'Mid Band 5a (4.6 - 8.5 GHz)',
    telescope: 1,
    value: BAND_5A,
    isBand5: true,
    units: 'GHz',
    mapping: 'mid_band_3',
    bandLimits: {
      [ANTENNA_15M]: [4.6e9, 8.5e9]
    }
  }, // Band 5a
  {
    label: 'Mid Band 5b (8.3 - 15.4 GHz)',
    telescope: 1,
    value: BAND_5B,
    isBand5: true,
    units: 'GHz',
    mapping: 'mid_band_4',
    bandLimits: {
      [ANTENNA_15M]: [8.3e9, 15.4e9]
    }
  } // Band 5b
];

export const BANNER_PMT_SPACER = 100;

export const CENTRAL_FREQUENCY_MAX = [350, 1.05, 1.76, 8.5, 15.4];
export const CENTRAL_FREQUENCY_MIN = [50, 0.35, 0.95, 4.6, 8.3];

export const DATA_PRODUCT = {
  observatoryDataProduct: [
    { label: 'Continuum Image', value: 1 },
    { label: 'Spectral Line Image', value: 2 }
  ],
  pipeline: [
    { label: 'Visibility receive', value: 1 },
    { label: '‘Real-time’ pointing calibration', value: 2 },
    { label: 'Visibility pre-processing', value: 3 },
    { label: 'Mid self-cal / ICal', value: 4 },
    { label: 'Low self-cal / ICal', value: 5 },
    { label: '‘Real-time’ gain calibration', value: 6 },
    { label: 'Distributed Gridding/Imaging', value: 7 }
  ]
};
export const DEFAULT_HELP = ['', ' ', ''];

export const EMPTY_STATUS = [5, 5, 5, 5, 5, 5, 5, 5, 5];
export const ENTRY_HEIGHT = 40;

export const FOOTER_HEIGHT = 20;
export const FOOTER_SPACER = 130;

export const FREQUENCY_GHZ = 1;
export const FREQUENCY_MHZ = 2;
export const FREQUENCY_KHZ = 3;
export const FREQUENCY_HZ = 4;

export const FREQUENCY_UNITS = [
  { label: 'GHz', value: FREQUENCY_GHZ, mapping: 'GHz', toHz: 1 },
  { label: 'MHz', value: FREQUENCY_MHZ, mapping: 'MHz', toHz: 1000 },
  { label: 'kHz', value: FREQUENCY_KHZ, mapping: 'kHz', toHz: 10000000 },
  { label: 'Hz', value: FREQUENCY_HZ, mapping: 'Hz', toHz: 10000000000 }
];

export const GENERAL = {
  ScienceCategory: [
    { label: 'Cosmology', subCategory: [{ label: 'Not specified', value: 1 }], value: 1 },
    { label: 'Cradle of Life', subCategory: [{ label: 'Not specified', value: 1 }], value: 2 },
    {
      label: 'Epoch of Re-ionization',
      subCategory: [{ label: 'Not specified', value: 1 }],
      value: 3
    },
    {
      label: 'Extragalactic continuum',
      subCategory: [{ label: 'Not specified', value: 1 }],
      value: 4
    },
    {
      label: 'Extragalactic Spectral line',
      subCategory: [{ label: 'Not specified', value: 1 }],
      value: 5
    },
    { label: 'Gravitational Waves', subCategory: [{ label: 'Not specified', value: 1 }], value: 6 },
    {
      label: 'High Energy Cosmic Particles',
      subCategory: [{ label: 'Not specified', value: 1 }],
      value: 7
    },
    { label: 'HI Galaxy science', subCategory: [{ label: 'Not specified', value: 1 }], value: 8 },
    { label: 'Magnetism', subCategory: [{ label: 'Not specified', value: 1 }], value: 9 },
    { label: 'Our Galaxy', subCategory: [{ label: 'Not specified', value: 1 }], value: 10 },
    { label: 'Pulsars', subCategory: [{ label: 'Not specified', value: 1 }], value: 11 },
    { label: 'Solar, Heliospheric and Ionospheric Physics', value: 12 },
    { label: 'Transients', subCategory: [{ label: 'Not specified', value: 1 }], value: 13 },
    { label: 'VLBI', subCategory: [{ label: 'Not specified', value: 1 }], value: 14 }
  ]
};

export const HEADER_HEIGHT = 106;

export const HELP_FONT = 16;
export const HELP_VIEWPORT = '20vh';

export const IW_BRIGGS = 2;
export const IW_NATURAL = 0;
export const IW_UNIFORM = 1;
export const IMAGE_WEIGHTING = [
  { label: 'natural', lookup: 'natural', value: 0 },
  { label: 'uniform', lookup: 'uniform', value: 1 },
  { label: 'briggs', lookup: 'robust', value: 2 }
];

export const LAB_IS_BOLD = true;
export const LAB_POSITION = LABEL_POSITION.START;
export const LAST_PAGE = 9;

export const MULTIPLIER_HZ_GHZ = [1, 1, 1000, 1000000, 1000000000];

export const NAV = [
  '/proposal/title',
  '/proposal/team',
  '/proposal/general',
  '/proposal/science',
  '/proposal/target',
  '/proposal/observation',
  '/proposal/technical',
  '/proposal/data',
  '/proposal/src'
];
export const NOT_SPECIFIED = 'notSpecified';
export const NOT_APPLICABLE = 'N/A';
export const BEAM_SIZE_UNITS = 'arcsec2';
export const CUSTOM_VALID_FIELDS = [
  'continuumSensitivityWeighted',
  'spectralSensitivityWeighted',
  'integrationTime',
  'sensitivity',
  'continuumIntegrationTime',
  'spectralIntegrationTime'
];
export const WEIGHTING_FACTOR_DEFAULT = 1;

export const SBS_CONV_FACTOR_DEFAULT = 1;

export const INFINITY = 'Infinity';

export const PAGE_SRC_NET = 8;

export const PATH = ['/', '/addProposal', '/addObservation', '/addDataProduct', '/editObservation'];

export const PMT = [
  '/review/panel',
  '/review/list',
  '/review/proposal',
  '/review/panel/entry',
  '/review/panel/decisions',
  '/review/review',
  '/review/panel/decision'
];

export const PROJECTS = [
  {
    id: 1,
    mapping: 'standard_proposal',
    subProjects: [
      {
        id: 1,
        mapping: 'target_of_opportunity'
      },
      {
        id: 2,
        mapping: 'joint_proposal'
      },
      {
        id: 3,
        mapping: 'coordinated_proposal'
      },
      {
        id: 4,
        mapping: 'long_term_proposal'
      }
    ]
  },
  {
    id: 2,
    mapping: 'key_science_proposal',
    subProjects: [
      {
        id: 1,
        mapping: 'target_of_opportunity'
      },
      {
        id: 2,
        mapping: 'joint_proposal'
      },
      {
        id: 3,
        mapping: 'coordinated_proposal'
      }
    ]
  },
  {
    id: 3,
    mapping: 'director_time_proposal',
    subProjects: [
      {
        id: 1,
        mapping: 'target_of_opportunity'
      },
      {
        id: 2,
        mapping: 'joint_proposal'
      },
      {
        id: 3,
        mapping: 'coordinated_proposal'
      }
    ]
  }
];
export const PROPOSAL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  ACCEPTED: 'accepted',
  WITHDRAWN: 'withdrawn',
  REJECTED: 'rejected'
};

export const REVIEWER_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined'
};

export const TYPE_ZOOM = 0;
export const TYPE_CONTINUUM = 1;

export const OSCILLATION_UNITS = [
  { label: 'Hz', toHz: 1 },
  { label: 'kHz', toHz: 1000 },
  { label: 'MHz', toHz: 10000000 },
  { label: 'GHz', toHz: 10000000000 }
];

export const OB_SUBARRAY_AA05 = 1;
export const OB_SUBARRAY_AA1 = 2;
export const OB_SUBARRAY_AA2 = 3;
export const OB_SUBARRAY_AA2_CORE = 4;
export const OB_SUBARRAY_AA_STAR = 5;
export const OB_SUBARRAY_AA_STAR_15 = 6;
export const OB_SUBARRAY_AA_STAR_CORE = 7;
export const OB_SUBARRAY_AA4 = 8;
export const OB_SUBARRAY_AA4_15 = 9;
export const OB_SUBARRAY_AA4_13 = 10;
export const OB_SUBARRAY_AA4_CORE = 11;
export const OB_SUBARRAY_CUSTOM = 20;

export const SECOND_LABEL = 's';
export const MILLISECOND_LABEL = 'ms';
export const NANOSECOND_LABEL = 'us';
export const MICROSECOND_LABEL = 'ns';

export const SECONDS_UNITS = [
  { label: SECOND_LABEL, toSeconds: 1 },
  { label: MILLISECOND_LABEL, toSeconds: 0.001 },
  { label: MICROSECOND_LABEL, toSeconds: 0.000001 },
  { label: NANOSECOND_LABEL, toSeconds: 0.000000001 }
];

export const OBS_TYPES = ['spectral', 'continuum'];
export const OBSERVATION_TYPE = [TYPE_ZOOM, TYPE_CONTINUUM];
export const OBSERVATION_TYPE_BACKEND = ['Zoom', 'Continuum']; // TODO change it to lowercase
export const OBSERVATION_TYPE_SENSCALC = ['line', 'continuum'];

export const SUPPLIED_TYPE_INTEGRATION = 1;
export const SUPPLIED_TYPE_SENSITIVITY = 2;
export const OBSERVATION = {
  array: [
    {
      value: 1,
      subarray: [
        // MID
        {
          value: OB_SUBARRAY_AA05,
          map: 'AA0.5',
          label: 'AA0.5',
          numOf15mAntennas: 4,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false,
          maxContBandwidthHz: 800e6
        },
        {
          value: OB_SUBARRAY_AA1,
          map: 'AA1',
          label: 'AA1',
          numOf15mAntennas: 8,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false,
          maxContBandwidthHz: 800e6
        },
        {
          value: OB_SUBARRAY_AA2,
          map: 'AA2',
          label: 'AA2',
          numOf15mAntennas: 64,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false,
          maxContBandwidthHz: 800e6
        },
        {
          value: OB_SUBARRAY_AA_STAR,
          map: 'AA*',
          label: 'AA*',
          numOf15mAntennas: 80,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: true
        },
        {
          value: OB_SUBARRAY_AA_STAR_15,
          map: 'AA* (15-m antennas only)',
          label: 'AA* (15-m antennas only)',
          numOf15mAntennas: 80,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: OB_SUBARRAY_AA4,
          map: 'AA4',
          label: 'AA4',
          numOf15mAntennas: 133,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: true
        },
        {
          value: OB_SUBARRAY_AA4_15,
          map: 'AA4 (15-m antennas only)',
          label: 'AA4 (15-m antennas only)',
          numOf15mAntennas: 133,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: OB_SUBARRAY_AA4_13,
          map: 'AA*/AA4 (13.5-m antennas only)',
          label: 'AA*/AA4 (13.5-m antennas only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: true
        },
        {
          value: OB_SUBARRAY_CUSTOM,
          map: 'Custom',
          label: 'Custom',
          numOf15mAntennas: 133,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: false
        }
      ],
      bandWidth: [
        { label: '3.125 MHz', value: 1, mapping: 'MHz' },
        { label: '6.25 MHz', value: 2, mapping: 'MHz' },
        { label: '12.5 MHz', value: 3, mapping: 'MHz' },
        { label: '25 MHz', value: 4, mapping: 'MHz' },
        { label: '50 MHz', value: 5, mapping: 'MHz' },
        { label: '100 MHz', value: 6, mapping: 'MHz' },
        { label: '200 MHz', value: 7, mapping: 'MHz' }
      ]
    },
    {
      value: 2,
      subarray: [
        // LOW
        {
          value: OB_SUBARRAY_AA05,
          map: 'LOW_AA05_all',
          label: 'AA0.5',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 6,
          disableForBand5: false,
          continuumSpectralAveragingMax: 6906,
          maxContBandwidthHz: 75e6
        },
        {
          value: OB_SUBARRAY_AA1,
          map: 'LOW_AA1_all',
          label: 'AA1',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 18,
          disableForBand5: false,
          continuumSpectralAveragingMax: 6906,
          maxContBandwidthHz: 75e6
        },
        {
          value: OB_SUBARRAY_AA2,
          map: 'LOW_AA2_all',
          label: 'AA2',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 64,
          disableForBand5: false,
          continuumSpectralAveragingMax: 13812,
          maxContBandwidthHz: 150e6
        },
        {
          value: OB_SUBARRAY_AA2_CORE,
          map: 'LOW_AA2_core_only',
          label: 'AA2 (core only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 40,
          disableForBand5: false,
          continuumSpectralAveragingMax: 13812,
          maxContBandwidthHz: 150e6
        },
        {
          value: OB_SUBARRAY_AA_STAR,
          map: 'LOW_AAstar_all',
          label: 'AA*',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 307,
          disableForBand5: false,
          continuumSpectralAveragingMax: 27624
        },
        {
          value: OB_SUBARRAY_AA_STAR_CORE,
          map: 'LOW_AAstar_core_only',
          label: 'AA* (core only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 199,
          disableForBand5: false,
          continuumSpectralAveragingMax: 27624
        },
        {
          value: OB_SUBARRAY_AA4,
          map: 'LOW_AA4_all',
          label: 'AA4',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 512,
          disableForBand5: false,
          continuumSpectralAveragingMax: 27624
        },
        {
          value: OB_SUBARRAY_AA4_CORE,
          map: 'LOW_AA4_core_only',
          label: 'AA4 (core only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 224,
          disableForBand5: false,
          continuumSpectralAveragingMax: 27624
        },
        {
          value: OB_SUBARRAY_CUSTOM,
          map: 'Custom',
          label: 'Custom',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 512,
          disableForBand5: false,
          continuumSpectralAveragingMax: 27624
        }
      ],
      bandWidth: [
        { label: '24.4140625 kHz', value: 1, mapping: 'kHz' },
        { label: '48.828125 kHz', value: 2, mapping: 'kHz' },
        { label: '97.65625 kHz', value: 3, mapping: 'kHz' },
        { label: '195.3125 kHz', value: 4, mapping: 'kHz' },
        { label: '390.625 kHz', value: 5, mapping: 'kHz' },
        { label: '781.25 kHz', value: 6, mapping: 'kHz' },
        { label: '1562.5 kHz', value: 7, mapping: 'kHz' },
        { label: '3125 kHz', value: 8, mapping: 'kHz' }
      ]
    }
  ],
  SpectralAveraging: [
    { label: '1', value: 1, lookup: 1 },
    { label: '2', value: 2, lookup: 2 },
    { label: '3', value: 3, lookup: 3 },
    { label: '4', value: 4, lookup: 4 },
    { label: '6', value: 6, lookup: 6 },
    { label: '8', value: 8, lookup: 8 },
    { label: '12', value: 12, lookup: 12 },
    { label: '16', value: 16, lookup: 16 },
    { label: '24', value: 24, lookup: 24 },
    { label: '31', value: 31, lookup: 31 },
    { label: '32', value: 32, lookup: 32 },
    { label: '48', value: 48, lookup: 48 }
  ],
  CentralFrequencyOBLow: [{ lookup: 0, value: 200 }],
  CentralFrequencyOB1: [
    { lookup: 1, label: 'AA0.5', value: 0.7 },
    { lookup: 2, label: 'AA1', value: 0.7 },
    { lookup: 3, label: 'AA2', value: 0.7 },
    { lookup: 5, label: 'AA*', value: 0.7975 },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: 0.7 },
    { lookup: 8, label: 'AA4', value: 0.7975 },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: 0.7 },
    { lookup: 10, label: 'AA*/AA4 (13.5-m antennas only)', value: 0.7975 },
    { lookup: 20, label: 'Custom', value: 0.7975 }
  ],
  CentralFrequencyOB2: [
    { lookup: 1, label: 'AA0.5', value: 1.355 },
    { lookup: 2, label: 'AA1', value: 1.355 },
    { lookup: 3, label: 'AA2', value: 1.355 },
    { lookup: 5, label: 'AA*', value: 1.31 },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: 1.355 },
    { lookup: 8, label: 'AA4', value: 1.31 },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: 1.355 },
    { lookup: 10, label: 'AA*/AA4 (13.5-m antennas only)', value: 1.31 },
    { lookup: 20, label: 'Custom', value: 1.31 }
  ],
  CentralFrequencyOB5a: [{ value: 6.55 }],
  CentralFrequencyOB5b: [{ value: 11.85 }],
  ContinuumBandwidthOBLow: [
    { lookup: 1, label: 'AA0.5', value: 75 },
    { lookup: 2, label: 'AA1', value: 75 },
    { lookup: 3, label: 'AA2', value: 150 },
    { lookup: 4, label: 'AA2 (core only)', value: 150 },
    { lookup: 5, label: 'AA*', value: 300 },
    { lookup: 7, label: 'AA* (core only)', value: 300 },
    { lookup: 8, label: 'AA4', value: 300 },
    { lookup: 11, label: 'AA4 (core only)', value: 300 },
    { lookup: 20, label: 'Custom', value: 300 }
  ],
  ContinuumBandwidthOB1: [
    { lookup: 1, label: 'AA0.5', value: 0.7 },
    { lookup: 2, label: 'AA1', value: 0.7 },
    { lookup: 3, label: 'AA2', value: 0.7 },
    { lookup: 5, label: 'AA*', value: 0.435 },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: 0.7 },
    { lookup: 8, label: 'AA4', value: 0.435 },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: 0.7 },
    { lookup: 10, label: 'AA*/AA4 (13.5-m antennas only)', value: 0.435 },
    { lookup: 20, label: 'Custom', value: 0.435 }
  ],
  ContinuumBandwidthOB2: [
    { lookup: 1, label: 'AA0.5', value: 0.8 },
    { lookup: 2, label: 'AA1', value: 0.8 },
    { lookup: 3, label: 'AA2', value: 0.8 },
    { lookup: 5, label: 'AA*', value: 0.72 },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: 0.81 },
    { lookup: 8, label: 'AA4', value: 0.72 },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: 0.81 },
    { lookup: 10, label: 'AA*/AA4 (13.5-m antennas only)', value: 0.72 },
    { lookup: 20, label: 'Custom', value: 0.72 }
  ],
  ContinuumBandwidthOB5a: [
    { lookup: 1, label: 'AA0.5', value: 0.8 },
    { lookup: 2, label: 'AA1', value: 0.8 },
    { lookup: 3, label: 'AA2', value: 0.8 },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: 3.9 },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: 3.9 },
    { lookup: 20, label: 'Custom', value: 3.9 }
  ],
  ContinuumBandwidthOB5b: [
    { lookup: 1, label: 'AA0.5', value: 0.8 },
    { lookup: 2, label: 'AA1', value: 0.8 },
    { lookup: 3, label: 'AA2', value: 0.8 },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: 5 },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: 5 },
    { lookup: 20, label: 'Custom', value: 5 }
  ],
  SpectralResolutionObLow: [{ value: '5.43 kHz (8.1 km/s)' }],
  SpectralResolutionOb1: [
    { lookup: 0.7, value: '13.44 kHz (5.8 km/s)' },
    { lookup: 0.7975, value: '13.44 kHz (5.1 km/s)' }
  ],
  SpectralResolutionOb2: [
    { lookup: 1.355, value: '13.44 kHz (3.0 km/s)' },
    { lookup: 1.31, value: '13.44 kHz (3.1 km/s)' }
  ],
  SpectralResolutionOb5a: [{ value: '13.44 kHz (615.1 m/s)' }],
  SpectralResolutionOb5b: [{ value: '13.44 kHz (340.0 m/s)' }],
  // the spectral resolution matches a bandwidth value
  SpectralResolutionObLowZoom: [
    { value: '14.128508391203704 Hz (21.2 m/s)', bandWidthValue: 1 },
    { value: '28.25701678240741 Hz (42.4 m/s)', bandWidthValue: 2 },
    { value: '56.51403356481482 Hz (84.7 m/s)', bandWidthValue: 3 },
    { value: '113.02806712962963 Hz (169.4 m/s)', bandWidthValue: 4 },
    { value: '226.05613425925927 Hz (338.8 m/s)', bandWidthValue: 5 },
    { value: '452.11226851851853 Hz (677.7 m/s)', bandWidthValue: 6 },
    { value: '904.2245370370371 Hz (1.4 km/s)', bandWidthValue: 7 },
    { value: '1808.4490740740741 Hz (2.7 km/s)', bandWidthValue: 8 }
  ],
  // the spectral resolution matches a lookup and bandwidth value
  SpectralResolutionOb1Zoom: [
    { lookup: '0.7975', value: '0.21 kHz (78.9 m/s)', bandWidthValue: 1 },
    { lookup: '0.7975', value: '0.42 kHz (157.9 m/s)', bandWidthValue: 2 },
    { lookup: '0.7975', value: '0.84 kHz (315.8 m/s)', bandWidthValue: 3 },
    { lookup: '0.7975', value: '1.68 kHz (631.5 m/s)', bandWidthValue: 4 },
    { lookup: '0.7975', value: '3.36 kHz (1.3 m/s)', bandWidthValue: 5 },
    { lookup: '0.7975', value: '6.72 kHz (2.5 m/s)', bandWidthValue: 6 },
    { lookup: '0.7975', value: '13.44 kHz (5.1 m/s)', bandWidthValue: 7 },
    { lookup: '0.7', value: '0.21 kHz (89.9 m/s)', bandWidthValue: 1 },
    { lookup: '0.7', value: '0.42 kHz (179.9 m/s)', bandWidthValue: 2 },
    { lookup: '0.7', value: '0.84 kHz (359.8 m/s)', bandWidthValue: 3 },
    { lookup: '0.7', value: '1.68 kHz (719.5 m/s)', bandWidthValue: 4 },
    { lookup: '0.7', value: '3.36 kHz (1.4 km/s)', bandWidthValue: 5 },
    { lookup: '0.7', value: '6.72 kHz (2.9 km/s)', bandWidthValue: 6 },
    { lookup: '0.7', value: '13.44 kHz (5.8 km/s)', bandWidthValue: 7 }
  ],
  SpectralResolutionOb2Zoom: [
    { lookup: '1.31', value: '0.21 kHz (48.1 m/s)', bandWidthValue: 1 },
    { lookup: '1.31', value: '0.42 kHz (96.1 m/s)', bandWidthValue: 2 },
    { lookup: '1.31', value: '0.84 kHz (192.2 m/s)', bandWidthValue: 3 },
    { lookup: '1.31', value: '1.68 kHz (384.5 m/s)', bandWidthValue: 4 },
    { lookup: '1.31', value: '3.36 kHz (768.9 m/s)', bandWidthValue: 5 },
    { lookup: '1.31', value: '6.72 kHz (1.5 km/s)', bandWidthValue: 6 },
    { lookup: '1.31', value: '13.44 kHz (3.1 km/s)', bandWidthValue: 7 },
    { lookup: '1.355', value: '0.21 kHz (46.5 m/s)', bandWidthValue: 1 },
    { lookup: '1.355', value: '0.42 kHz (92.9 m/s)', bandWidthValue: 2 },
    { lookup: '1.355', value: '0.84 kHz (185.8 m/s)', bandWidthValue: 3 },
    { lookup: '1.355', value: '1.68 kHz (371.7 m/s)', bandWidthValue: 4 },
    { lookup: '1.355', value: '3.36 kHz (743.4 m/s)', bandWidthValue: 5 },
    { lookup: '1.355', value: '6.72 kHz (1.5 km/s)', bandWidthValue: 6 },
    { lookup: '1.355', value: '13.44 kHz (3.0 km/s)', bandWidthValue: 7 }
  ],
  // the spectral resolution matches a bandwidth value
  SpectralResolutionOb5aZoom: [
    { value: '0.21 kHz (9.6 m/s)', bandWidthValue: 1 },
    { value: '0.42 kHz (19.2 m/s)', bandWidthValue: 2 },
    { value: '0.84 kHz (38.4 m/s)', bandWidthValue: 3 },
    { value: '1.68 kHz (76.9 m/s)', bandWidthValue: 4 },
    { value: '3.36 kHz (153.8 m/s)', bandWidthValue: 5 },
    { value: '6.72 kHz (307.6 m/s)', bandWidthValue: 6 },
    { value: '13.44 kHz (615.1 m/s)', bandWidthValue: 7 }
  ],
  SpectralResolutionOb5bZoom: [
    { value: '0.21 kHz (5.3 m/s)', bandWidthValue: 1 },
    { value: '0.42 kHz (10.6 m/s)', bandWidthValue: 2 },
    { value: '0.84 kHz (21.3 m/s)', bandWidthValue: 3 },
    { value: '1.68 kHz (42.5 m/s)', bandWidthValue: 4 },
    { value: '3.36 kHz (85.0 m/s)', bandWidthValue: 5 },
    { value: '6.72 kHz (170.0 m/s)', bandWidthValue: 6 },
    { value: '13.44 kHz (340.0 m/s))', bandWidthValue: 7 }
  ],
  Supplied: [
    {
      label: 'Integration Time', // TODO check if label still needed as we use sensCalcResultsLabel in calculate results
      sensCalcResultsLabel: 'integrationTime',
      mappingLabel: 'integration_time',
      value: SUPPLIED_TYPE_INTEGRATION,
      units: [
        { label: 'd', value: 1 },
        { label: 'h', value: 2 },
        { label: 'min', value: 3 },
        { label: SECOND_LABEL, value: 4 },
        { label: MILLISECOND_LABEL, value: 5 },
        { label: NANOSECOND_LABEL, value: 6 },
        { label: MICROSECOND_LABEL, value: 7 }
      ]
    },
    {
      label: 'Sensitivity', // TODO check if label still needed as we use sensCalcResultsLabel in calculate results
      sensCalcResultsLabel: 'sensitivity',
      mappingLabel: 'sensitivity',
      value: SUPPLIED_TYPE_SENSITIVITY,
      units: [
        { label: 'Jy/beam', value: 1 },
        { label: 'mJy/beam', value: 2 },
        { label: 'uJy/beam', value: 3 },
        { label: 'nJy/beam', value: 4 },
        { label: 'K', value: 5 },
        { label: 'mK', value: 6 },
        { label: 'uK', value: 7 }
      ]
    }
  ],
  Units: [
    { label: 'GHz', value: 1 },
    { label: 'MHz', value: 2 },
    { label: 'kHz', value: 3 },
    { label: 'Hz', value: 4 }
  ]
};

export const SUPPLIED_INTEGRATION_TIME_UNITS_H = 2;
export const SUPPLIED_INTEGRATION_TIME_UNITS_S = 4;

export const RA_TYPE_EQUATORIAL = 0;
export const RA_TYPE_GALACTIC = 1;
export const ROBUST = [
  { label: '-2', value: 1 },
  { label: '-1', value: 2 },
  { label: '0', value: 3 },
  { label: '1', value: 4 },
  { label: '2', value: 5 }
];

export const UPLOAD_MAX_WIDTH_CSV = 25;
export const UPLOAD_MAX_WIDTH_PDF = 25;

export const VEL_TYPES = [
  { label: 'Velocity', value: 0 },
  { label: 'Redshift', value: 1 }
];

export const VEL_UNITS = [
  { label: 'km/s', value: 0 },
  { label: 'm/s', value: 1 }
];

export const REF_COORDINATES_UNITS = [
  {
    value: 1,
    label: 'equatorial',
    units: ['hourangle', 'deg']
  },
  {
    value: 2,
    label: 'galactic',
    units: ['deg', 'deg']
  }
];

export const SEARCH_TYPE_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Rejected', value: 'rejected' }
];
export const SEARCH_TYPE_OPTIONS_REVIEWERS = [
  { label: 'Pulsar Timing', value: 'Pulsar Timing' },
  { label: 'Galaxy Evolution', value: 'Galaxy Evolution' },
  { label: 'Radio Transients', value: 'Radio Transients' },
  { label: 'Cosmic Magnetism', value: 'Cosmic Magnetism' },
  { label: 'HI Surveys', value: 'HI Surveys' }
];
export const SEARCH_PROPOSAL_TYPE_OPTIONS = [
  { label: 'Principal Investigator (PI)', value: PROJECTS[0].mapping },
  { label: 'Key Science Projects', value: PROJECTS[1].mapping },
  { label: "Director-General's Discretionary Time", value: PROJECTS[2].mapping }
];
export const SPECTRAL_AVERAGING_MIN = 1;

export const ZOOM_SPECTRAL_AVERAGING_MAX = 864;

export const SPEED_OF_LIGHT = 299792458; // m/s

export const STATUS_OK = 0;
export const STATUS_ERROR = 1;
export const STATUS_ERROR_SYMBOL = '!';
export const STATUS_PARTIAL = 3;
export const STATUS_INITIAL = 5;
export const STATUS = {
  OK: STATUS_OK,
  ERROR: STATUS_ERROR,
  PARTIAL: STATUS_PARTIAL,
  INITIAL: STATUS_INITIAL
};
export const SUPPLIED_VALUE_DEFAULT_MID = 600;
export const SUPPLIED_VALUE_DEFAULT_LOW = 1;

export const TARGET_OPTION = {
  LIST_OF_TARGETS: 1,
  TARGET_MOSAIC: 2,
  NO_SPECIFIC_TARGET: 3
};
export const TARGETS = {
  'No Target': null,
  'Create Mosaic': null
};
export const TEAM_STATUS_TYPE_OPTIONS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected'
};
export const TEL = ['', 'Mid', 'Low'];

export const TELESCOPE_MID_NUM = 1;
export const TELESCOPE_LOW_NUM = 2;
export const TELESCOPES = [
  { label: TELESCOPE_MID.code.toUpperCase(), value: 1 },
  { label: TELESCOPE_LOW.code.toUpperCase(), value: 2 }
];

// This is the fundamental limits of the bandwidth provided by SKA LOW and MID
export const BANDWIDTH_MIN_CHANNEL_WIDTH_HZ = {
  [TELESCOPE_MID_NUM]: 13.44e3,
  [TELESCOPE_LOW_NUM]: (24 * 781.25e3) / 3456 // TODO find meaning of numbers for clarity
};

export const TELESCOPE_LOW_BACKEND_MAPPING = 'ska_low';
export const TELESCOPE_MID_BACKEND_MAPPING = 'ska_mid';

export const TEXT_ENTRY_PARAMS = {
  DEFAULT: {
    MAX_LENGTH: 50,
    ERROR_TEXT: 'specialCharacters.invalid',
    PATTERN: /^[a-zA-Z0-9\s\-_:;&><#.,!"%*+='/]*$/
  },
  EMAIL: {
    MAX_LENGTH: 25,
    ERROR_TEXT: 'specialCharacters.email',
    // eslint-disable-next-line no-useless-escape
    PATTERN: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  },
  TITLE: {
    MAX_LENGTH: 20,
    ERROR_TEXT: 'specialCharacters.invalid',
    // eslint-disable-next-line no-useless-escape
    PATTERN: /^[a-zA-Z0-9\s\-_:;$^!&><#.,"%*+='{}/\\]*$/
  },
  NUMBER_ONLY: {
    ERROR_TEXT: 'error.invalidString',
    // eslint-disable-next-line no-useless-escape
    PATTERN: /^[0-9]+(\.[0-9]+)?$/
  }
};

export const VELOCITY_TYPE = {
  VELOCITY: 0,
  REDSHIFT: 1
};

export const VELOCITY_UNITS = [
  { label: 'm/s', value: 0, convert: 1 },
  { label: 'km/s', value: 1, convert: 1000 }
];

export const WRAPPER_HEIGHT = '75px';

export const LOW_BEAM_SIZE_PRECISION = 1;
export const MID_BEAM_SIZE_PRECISION = 3;

export const PDF_NAME_PREFIXES = {
  SCIENCE: 'science-doc-',
  TECHNICAL: 'technical-doc-'
};

export const CYCLE = 'cycle-001';

/***************************************************************/

export const DEFAULT_PI = {
  id: 'prp-ska01-202204-01',
  firstName: 'DefaultUser',
  lastName: 'DefaultUser',
  email: 'ask.lop@map.com',
  country: 'Lagoon',
  affiliation: 'University of Free Town',
  phdThesis: false,
  status: TEAM_STATUS_TYPE_OPTIONS.accepted,
  pi: true
};

export const DEFAULT_TARGETS = {
  dec: '123',
  decUnit: '1',
  id: 1,
  latitude: '123',
  longitude: '123',
  name: 'DUMMY',
  ra: '123',
  raUnit: '1',
  redshift: '123',
  referenceFrame: 0,
  vel: '123',
  velType: 0,
  velUnit: 0
};
