import { LABEL_POSITION, TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import Target from './types/target';
import Investigator from './types/investigator';
import { env } from '@/env';
export const USE_LOCAL_DATA = env.REACT_APP_USE_LOCAL_DATA === 'true';
export const cypressToken = window.localStorage.getItem('cypress:token');
export const cypressProposal = window.localStorage.getItem('cypress:proposalCreated') === 'true';
export const cypressEditProposal = window.localStorage.getItem('cypress:proposalEdit') === 'true';

export const USE_LOCAL_DATA_SENSITIVITY_CALC =
  env.REACT_APP_USE_LOCAL_DATA_SENSITIVITY_CALC === 'true';
export const SKA_OSO_SERVICES_URL = env.REACT_APP_SKA_OSO_SERVICES_URL;
export const SKA_SENSITIVITY_CALCULATOR_API_URL = env.REACT_APP_SKA_SENSITIVITY_CALC_URL;
export const API_VERSION = '/senscalc/api/v11';

export const OSO_SERVICES_PHT = '/pht/';
export const OSO_SERVICES_PANEL_PATH = `${OSO_SERVICES_PHT}panels`;
export const OSO_SERVICES_PANEL_DECISIONS_PATH = `${OSO_SERVICES_PHT}panel/decision/`;
export const OSO_SERVICES_PROPOSAL_PATH = `${OSO_SERVICES_PHT}prsls`;
export const OSO_SERVICES_PROPOSAL_ACCESS_PATH = `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PHT}proposal-access`;
export const OSO_SERVICES_REPORT_PATH = `${OSO_SERVICES_PHT}report/`;
export const OSO_SERVICES_REVIEWS_PATH = `${OSO_SERVICES_PHT}reviews`;
export const OSO_SERVICES_REVIEWERS_PATH = `${OSO_SERVICES_PHT}reviewers`;
export const OSO_SERVICES__PATH = `${OSO_SERVICES_PHT}reviewers`;
export const OSO_SERVICES_MEMBER_PATH = `${OSO_SERVICES_PHT}prsls/member`;
export const OSO_SERVICES_CALIBRATORS_PATH = `${OSO_SERVICES_PHT}calibrators`;
//
export const MSENTRA_CLIENT_ID = env.MSENTRA_CLIENT_ID;
export const MSENTRA_TENANT_ID = env.MSENTRA_TENANT_ID;
export const MSENTRA_REDIRECT_URI = env.MSENTRA_REDIRECT_URI;
export const MSENTRA_API_URI = 'api://e4d6bb9b-cdd0-46c4-b30a-d045091b501b';
//
export const APP_OVERRIDE_GROUPS = window.Cypress
  ? localStorage.getItem('cypress:group')
  : env.REACT_APP_OVERRIDE_GROUPS;

export const isCypress = typeof window !== 'undefined' && window.Cypress;

/*****************************************/

export const AUTO_SAVE_INTERVAL = 30; // seconds
export const BAND_LOW = 0;
export const BAND_1 = 1;
export const BAND_2 = 2;
export const BAND_5A = 3;
export const BAND_5B = 4;

export const BAND_1_STR = 'Band_1';
export const BAND_2_STR = 'Band_2';

export const BAND_5A_STR = 'Band_5a';
export const BAND_5B_STR = 'Band_5b';

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
    mapping: 'mid_band_5a',
    bandLimits: {
      [ANTENNA_15M]: [4.6e9, 8.5e9]
    }
  },
  {
    label: 'Mid Band 5b (8.3 - 15.4 GHz)',
    telescope: 1,
    value: BAND_5B,
    isBand5: true,
    units: 'GHz',
    mapping: 'mid_band_5b',
    bandLimits: {
      [ANTENNA_15M]: [8.3e9, 15.4e9]
    }
  }
];
export const DEFAULT_USER = 'DefaultUser';
export const TMP_REVIEWER_ID = 'c8f8f18a-3c70-4c39-8ed9-2d8d180d99a3';

export const FEASIBLE_MAYBE = 'Maybe'; // TODO 'Yes with revision';
export const FEASIBLE_NO = 'No';
export const FEASIBLE_YES = 'Yes';
export const FEASIBILITY = [FEASIBLE_YES, FEASIBLE_NO, FEASIBLE_MAYBE];

export const SPACER_HEADER = 11;
export const SPACER_FOOTER = 0; // Just here to show it has been considered

export const BANNER_PMT_SPACER = SPACER_HEADER;
export const BANNER_PMT_SPACER_MIN = SPACER_HEADER + 70;

export const FOOTER_PMT = 65;
export const FOOTER_PMT_SPACER = SPACER_FOOTER + FOOTER_PMT;

export const CENTRAL_FREQUENCY_MAX = [350, 1.05, 1.76, 8.5, 15.4];
export const CENTRAL_FREQUENCY_MIN = [50, 0.35, 0.95, 4.6, 8.3];

export const CONFLICT_REASONS = [
  'conflict-none',
  'conflict-investigator',
  'conflict-collaborator',
  'conflict-other'
];

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

export const EMPTY_STATUS = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
export const ENTRY_HEIGHT = 40;

export const FOOTER_HEIGHT = 20;
export const FOOTER_HEIGHT_PHT = 60;
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
  ],
  ObservingMode: [
    { label: 'Zoom', subCategory: [{ label: 'Not specified', value: 1 }], value: 101 },
    { label: 'Continuum', subCategory: [{ label: 'Not specified', value: 1 }], value: 102 },
    { label: 'PST', subCategory: [{ label: 'Not specified', value: 1 }], value: 103 }
  ]
};

export const GRID_MEMBERS_ACTIONS = {
  delete: 'delete',
  access: 'access'
};

export const HEADER_HEIGHT = 78;

export const HELP_FONT = 16;

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
export const LAST_PAGE = 11;

export const MULTIPLIER_HZ_GHZ = [1, 1, 1000, 1000000, 1000000000];

export const NAV = [
  '/proposal/title',
  '/proposal/team',
  '/proposal/general',
  '/proposal/science',
  '/proposal/target',
  '/proposal/observation',
  '/proposal/calibration',
  '/proposal/technical',
  '/proposal/data',
  '/proposal/src',
  '/proposal/linking'
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

export const PAGE_TECHNICAL = 7;
export const PAGE_SRC_NET = 9;

export const PATH = ['/', '/addProposal', '/addObservation', '/addDataProduct', '/editObservation'];

export const PMT = [
  '/review/panel',
  '/review/list',
  '/review/proposal',
  '',
  '/review/panel/decisions',
  '/review/science',
  '/review/technical'
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

export const SCIENCE_VERIFICATION = 'science_verification';

export const PROPOSAL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  ACCEPTED: 'accepted',
  WITHDRAWN: 'withdrawn',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under review'
};
export const PROPOSAL_STATUS_OPTIONS = [
  { label: 'Draft', value: PROPOSAL_STATUS.DRAFT },
  { label: 'Submitted', value: PROPOSAL_STATUS.SUBMITTED },
  { label: 'Under Review', value: PROPOSAL_STATUS.UNDER_REVIEW },
  { label: 'Accepted', value: PROPOSAL_STATUS.ACCEPTED },
  { label: 'Withdrawn', value: PROPOSAL_STATUS.WITHDRAWN },
  { label: 'Rejected', value: PROPOSAL_STATUS.REJECTED }
];

export const RECOMMENDATION_ACCEPT_REVISION = 'Accepted with Revision';
export const RECOMMENDATION_REJECT = 'Rejected';
export const RECOMMENDATION_ACCEPT = 'Accepted';
export const RECOMMENDATION = [
  RECOMMENDATION_ACCEPT,
  RECOMMENDATION_REJECT,
  RECOMMENDATION_ACCEPT_REVISION
];

export const RECOMMENDATION_STATUS_IN_PROGRESS = 'In Progress';
export const RECOMMENDATION_STATUS_DECIDED = 'Decided';
export const RECOMMENDATION_STATUS_TO_DO = 'To Do';
export const RECOMMENDATION_STATUS = [
  RECOMMENDATION_STATUS_IN_PROGRESS,
  RECOMMENDATION_STATUS_DECIDED,
  RECOMMENDATION_STATUS_TO_DO
];

export const REVIEWER_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined'
};

export const PANEL_DECISION_STATUS = {
  TO_DO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEWED: 'Reviewed',
  DECIDED: 'Decided'
};

export const REVIEW_TYPE = {
  ALL: 'All',
  SCIENCE: 'Science Review',
  TECHNICAL: 'Technical Review'
};

export const REVIEW_TYPE_PREFIX = {
  SCIENCE: 'rvw-sci-',
  TECHNICAL: 'rvw-tec-'
};

export const TECHNICAL_FEASIBILITY = {
  YES: 'Yes',
  NO: 'No',
  MAYBE: 'Maybe'
};

export const TYPE_ZOOM = 0;
export const TYPE_CONTINUUM = 1;

export const TYPE_PSS = 2;
export const PULSAR_MODE_FOLDED = 'folded_pulse';

export const OSCILLATION_UNITS = [
  { label: 'Hz', toHz: 1 },
  { label: 'kHz', toHz: 1000 },
  { label: 'MHz', toHz: 10000000 },
  { label: 'GHz', toHz: 10000000000 }
];
//TODO: Refactor such that these identifiers are no longer needed and references can be per array label
export const OB_SUBARRAY_AA2 = 3;
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
export const SUPPLIED_TYPE_INTEGRATION = 1;
export const SUPPLIED_TYPE_SENSITIVITY = 2;
export const SUPPLIED_INTEGRATION_TIME_UNITS_H = 2;
export const SUPPLIED_INTEGRATION_TIME_UNITS_S = 4;

export const RA_TYPE_ICRS = { value: 0, label: 'icrs' };
export const RA_TYPE_GALACTIC = { value: 1, label: 'galactic' };

export const FIELD_PATTERN_POINTING_CENTRES = 'Pointing centres';

export const DEFAULT_GALACTIC = '00:00:00.0';
export const DEFAULT_EQUATORIAL = 0;
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

export const TECHNICAL_FEASIBILITY_OPTIONS = [
  { label: 'Yes', value: FEASIBILITY[0] },
  { label: 'No', value: FEASIBILITY[1] },
  { label: 'Maybe', value: FEASIBILITY[2] }
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
  [TELESCOPE_LOW_NUM]: (24 * 781.25e3) / 3456
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
    PATTERN: /^[a-zA-Z0-9\s\-_:;$^!&><#.,"%*+='{}/\\?]*$/
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

/***************************************************************/

export const DEFAULT_INVESTIGATOR: Investigator = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  affiliation: '',
  phdThesis: false,
  status: TEAM_STATUS_TYPE_OPTIONS.pending,
  pi: false,
  officeLocation: null,
  jobTitle: null
};

export const DEFAULT_TARGETS: Target = {
  kind: RA_TYPE_ICRS.value,
  decStr: '123',
  id: 1,
  b: 123,
  l: 123,
  name: 'DUMMY',
  raStr: '123',
  redshift: '123',
  referenceFrame: RA_TYPE_ICRS.label,
  vel: '123',
  velType: 0,
  velUnit: 0
};

export const DUMMY_PROPOSAL_ID = 'dummy-proposal-id';
