import { LABEL_POSITION, TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import Target from './types/target';
import Investigator from './types/investigator';
import Observation from './types/observation';
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
export const OSO_SERVICES_MEMBER_PATH = `${OSO_SERVICES_PHT}prsls/member`;
export const OSO_SERVICES_CALIBRATORS_PATH = `${OSO_SERVICES_PHT}calibrators`;
export const OSO_SERVICES_VISIBILITY_PATH = `${SKA_OSO_SERVICES_URL}/visibility/visibility`;
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

export const BAND_LOW_STR = 'low_band';
export const BAND_1_STR = 'Band_1';
export const BAND_2_STR = 'Band_2';
export const BAND_3_STR = 'Band_3';
export const BAND_4_STR = 'Band_4';
export const BAND_5A_STR = 'Band_5a';
export const BAND_5B_STR = 'Band_5b';

export const ANTENNA_LOW = 'low';
export const ANTENNA_13M = '13m';
export const ANTENNA_15M = '15m';
export const ANTENNA_MIXED = 'mixed';

export const DEFAULT_USER = 'DefaultUser';
export const TMP_REVIEWER_ID = 'c8f8f18a-3c70-4c39-8ed9-2d8d180d99a3';

export const FEASIBLE_MAYBE = 'Maybe'; // TODO 'Yes with revision';
export const FEASIBLE_NO = 'No';
export const FEASIBLE_YES = 'Yes';
export const FEASIBILITY = [FEASIBLE_YES, FEASIBLE_NO, FEASIBLE_MAYBE];

export const SPACER_HEADER = 11;
export const SPACER_FOOTER = 0; // Just here to show it has been considered

export const BANNER_PMT_SPACER = SPACER_HEADER;
export const BANNER_PMT_SPACER_MIN = SPACER_HEADER + 100;

export const FOOTER_PMT = 65;
export const FOOTER_PMT_SPACER = SPACER_FOOTER + FOOTER_PMT;

export const BIT_DEPTH = [
  { value: '1' },
  { value: '2' },
  { value: '4' },
  { value: '8' },
  { value: '16' },
  { value: '32' }
];

export const CHANNELS_OUT_MAX = 40;

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

export const DP_TYPE_IMAGES = 1;
export const DP_TYPE_VISIBLE = 2;

export const DEFAULT_HELP = ['', ' ', ''];

export const ERROR_SECS = 2000;

export const EMPTY_STATUS = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // See SRCNet INACTIVE
export const ENTRY_HEIGHT = 40;

export const FOOTER_HEIGHT = 20;
export const FOOTER_HEIGHT_PHT = 60;
export const FOOTER_SPACER = 130;

export const FREQUENCY_GHZ = 1;
export const FREQUENCY_MHZ = 2;
export const FREQUENCY_KHZ = 3;
export const FREQUENCY_HZ = 4;

export const FREQUENCY_STR_HZ = 'Hz';
export const FREQUENCY_STR_MHZ = 'MHz';
export const FREQUENCY_STR_KHZ = 'kHz';
export const FREQUENCY_STR_GHZ = 'GHz';

export const TEL = ['', 'Mid', 'Low'];
export const TEL_UNITS = ['', FREQUENCY_STR_GHZ, FREQUENCY_STR_MHZ];

export const FREQUENCY_UNITS = [
  { label: FREQUENCY_STR_GHZ, value: FREQUENCY_GHZ, mapping: FREQUENCY_STR_GHZ, toHz: 1 },
  { label: FREQUENCY_STR_MHZ, value: FREQUENCY_MHZ, mapping: FREQUENCY_STR_MHZ, toHz: 1000 },
  { label: FREQUENCY_STR_KHZ, value: FREQUENCY_KHZ, mapping: FREQUENCY_STR_KHZ, toHz: 1000000 },
  { label: FREQUENCY_STR_HZ, value: FREQUENCY_HZ, mapping: FREQUENCY_STR_HZ, toHz: 1000000000 }
];

export const TYPE_ZOOM = 0;
export const TYPE_CONTINUUM = 1;
export const TYPE_PST = 2;

export const DETAILS = {
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
    {
      label: 'Spectral',
      subCategory: [{ label: 'Not specified', value: 1 }],
      value: TYPE_ZOOM,
      observationType: TYPE_ZOOM
    },
    {
      label: 'Continuum',
      subCategory: [{ label: 'Not specified', value: 1 }],
      value: TYPE_CONTINUUM,
      observationType: TYPE_CONTINUUM
    },
    {
      label: 'PST',
      subCategory: [{ label: 'Not specified', value: 1 }],
      value: TYPE_PST,
      observationType: TYPE_PST
    }
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
export const ROBUST_DEFAULT = 1;
export const TAPER_DEFAULT = 0;

export const POLARISATIONS = [
  { value: 'I' },
  { value: 'Q' },
  { value: 'U' },
  { value: 'V' },
  { value: 'XX' },
  { value: 'XY' },
  { value: 'YX' },
  { value: 'YY' }
];
export const POLARISATIONS_PST_FLOW = [{ value: 'X' }, { value: 'Y' }];
export const POLARISATIONS_PST_BANK = [
  { value: 'I' },
  { value: 'Q' },
  { value: 'U' },
  { value: 'V' }
];

export const IMAGE_WEIGHTING = [
  { label: 'natural', lookup: 'natural', value: IW_NATURAL },
  { label: 'uniform', lookup: 'uniform', value: IW_UNIFORM },
  { label: 'briggs', lookup: 'briggs', value: IW_BRIGGS }
];

export const LAB_IS_BOLD = true;
export const LAB_POSITION = LABEL_POSITION.START;

export const LAB_POSITION_ABOVE = LABEL_POSITION.above;

export const LAB_POS_TICK = LABEL_POSITION.END;

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
  '/proposal/linking',
  '/proposal/calibration',
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

export const TIME_DAYS = 1;
export const TIME_HOURS = 2;
export const TIME_MINS = 3;
export const TIME_SECS = 4;
export const TIME_MS = 5;
export const TIME_US = 6;
export const TIME_NS = 7;
export const TIME_UNITS = [
  { id: TIME_DAYS, value: 'd', toDay: 1 },
  { id: TIME_HOURS, value: 'h', toDay: 24 },
  { id: TIME_MINS, value: 'min', toDay: 1440 },
  { id: TIME_SECS, value: 's', toDay: 86400 },
  { id: TIME_MS, value: 'ms', toDay: 86400 * 1000 },
  { id: TIME_US, value: 'μs', toDay: 86400 * 1000000 },
  { id: TIME_NS, value: 'ns', toDay: 86400 * 1000000000 }
];

export const INFINITY = 'Infinity';

export const DECIMAL_PLACES = 2;

export const DEFAULT_LOW_SUPPLIED_INTEGRATION_TIME = { value: 1, unit: '2' };
export const DEFAULT_LOW_SUPPLIED_SENSITIVITY = { value: 1, unit: '1' };

export const PAGE_TITLE_ADD = 0;
export const PAGE_TEAM = 1;
export const PAGE_DETAILS = 2;
export const PAGE_DESCRIPTION = 3;
export const PAGE_TARGET = 4;
export const PAGE_OBSERVATION = 5;
export const PAGE_TECHNICAL = 6;
export const PAGE_DATA_PRODUCTS = 7;
export const PAGE_LINKING = 8;
export const PAGE_CALIBRATION = 9;
export const PAGE_SRC_NET = 10;
export const PAGE_OBSERVATION_ADD = 11;
export const PAGE_LANDING = 12;
export const PAGE_CYCLE = 13;
export const PAGE_DATA_PRODUCTS_ADD = 14;
export const PAGE_OBSERVATION_UPDATE = 15;
export const PAGE_PANEL_MANAGEMENT = 16;

export const PATH = ['/', '/addProposal', '/addObservation', '/addDataProduct', '/editObservation'];

export const PMT = [
  '/review/panel',
  '/review/list',
  '/review/proposal',
  '/review/NOT_USED',
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

export const FLOW_THROUGH_VALUE = 0;
export const DETECTED_FILTER_BANK_VALUE = 1;
export const PULSAR_TIMING_VALUE = 2;

export const TELESCOPE_LOW_CODE = 'low';

export const SENSITIVITY_K = 5;
export const SENSITIVITY_UNITS = [
  { id: 1, value: 'Jy/beam', mapping: 'Jy / beam', toBase: 1 },
  { id: 2, value: 'mJy/beam', mapping: 'mJy/beam', toBase: 1000 },
  { id: 3, value: 'μJy/beam', mapping: 'μJy/beam', toBase: 1000000 },
  { id: 4, value: 'nJy/beam', mapping: 'nJy / beam', toBase: 1000000000 },
  { id: SENSITIVITY_K, value: 'K', mapping: 'K', toBase: 1000 },
  { id: 6, value: 'mK', mapping: 'mK', toBase: 1000000 },
  { id: 7, value: 'uK', mapping: 'uK', toBase: 1000000000 }
];

export const PST_MODES = [
  {
    value: FLOW_THROUGH_VALUE,
    mapping: 'flow through'
  },
  {
    value: DETECTED_FILTER_BANK_VALUE,
    mapping: 'detected filterbank'
  },
  {
    value: PULSAR_TIMING_VALUE,
    mapping: 'pulsar timing'
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

export const PULSAR_MODE_FOLDED = 'folded_pulse';

export const OSCILLATION_UNITS = [
  { label: FREQUENCY_STR_HZ, toHz: 1 },
  { label: FREQUENCY_STR_KHZ, toHz: 1000 },
  { label: FREQUENCY_STR_MHZ, toHz: 10000000 },
  { label: FREQUENCY_STR_GHZ, toHz: 10000000000 }
];
//TODO: Refactor such that these identifiers are no longer needed and references can be per array label
export const SA_AA2 = 'aa2';
export const SA_AA_STAR = 'aa*';
export const SA_CUSTOM = 'custom';

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

export const TYPE_STR_ZOOM_SHORT = 'spectral';
export const TYPE_STR_ZOOM = 'spectral line';
export const TYPE_STR_CONTINUUM = 'continuum';
export const TYPE_STR_PST = 'pst';

export const OBS_TYPES = [TYPE_STR_ZOOM_SHORT, TYPE_STR_CONTINUUM];
export const OBSERVATION_TYPE = [TYPE_ZOOM, TYPE_CONTINUUM, TYPE_PST];
export const OBSERVATION_TYPE_BACKEND = [TYPE_STR_ZOOM, TYPE_STR_CONTINUUM, TYPE_STR_PST];
export const OBSERVATION_TYPE_SHORT_BACKEND = [
  TYPE_STR_ZOOM_SHORT,
  TYPE_STR_CONTINUUM,
  TYPE_STR_PST
];
export const SUPPLIED_TYPE_INTEGRATION = 1;
export const SUPPLIED_TYPE_SENSITIVITY = 2;
export const SUPPLIED_INTEGRATION_TIME_UNITS_H = 2;
export const SUPPLIED_INTEGRATION_TIME_UNITS_S = 4;

export const RA_TYPE_ICRS = { value: 0, label: 'icrs' };
export const RA_TYPE_GALACTIC = { value: 1, label: 'galactic' };

export const SEPARATOR0 = '?';
export const SEPARATOR1 = '&';

export const FIELD_PATTERN_POINTING_CENTRES = 'Pointing centres';

export const DEFAULT_GALACTIC = '00:00:00.0';
export const DEFAULT_EQUATORIAL = 0;
export const ROBUST = [
  { label: '-2', value: -2 },
  { label: '-1', value: -1 },
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 }
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
// TODO check if we should use different default values for mid and low bandwidth
export const ZOOM_BANDWIDTH_DEFAULT_MID = 1;
export const ZOOM_BANDWIDTH_DEFAULT_LOW = 5;

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

export const TELESCOPE_MID_NUM = 1;
export const TELESCOPE_LOW_NUM = 2;
export const TELESCOPES = [
  { label: TELESCOPE_MID.code?.toUpperCase(), value: 1 },
  { label: TELESCOPE_LOW.code?.toUpperCase(), value: 2 }
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
  velUnit: 0,
  tiedArrayBeams: null
};

export const DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2: Observation = {
  id: 'obs-0000000',
  telescope: TELESCOPE_LOW_NUM,
  subarray: SA_AA2,
  linked: '0',
  type: TYPE_CONTINUUM,
  observingBand: BAND_LOW_STR,
  centralFrequency: 200,
  centralFrequencyUnits: FREQUENCY_MHZ,
  continuumBandwidth: 150,
  continuumBandwidthUnits: FREQUENCY_MHZ,
  elevation: 15,
  bandwidth: null,
  numStations: 68,
  numSubBands: 1,
  supplied: {
    type: SUPPLIED_TYPE_INTEGRATION,
    value: SUPPLIED_VALUE_DEFAULT_LOW,
    units: SUPPLIED_INTEGRATION_TIME_UNITS_H
  },
  spectralAveraging: 1,
  spectralResolution: '',
  effectiveResolution: ''
};

export const DEFAULT_ZOOM_OBSERVATION_LOW_AA2: Observation = {
  id: 'obs-0000000',
  telescope: TELESCOPE_LOW_NUM,
  subarray: SA_AA2,
  linked: '0',
  type: TYPE_ZOOM,
  observingBand: BAND_LOW_STR,
  centralFrequency: 200,
  centralFrequencyUnits: FREQUENCY_MHZ,
  continuumBandwidth: null,
  continuumBandwidthUnits: null,
  elevation: 15,
  bandwidth: ZOOM_BANDWIDTH_DEFAULT_LOW,
  numStations: 68,
  numSubBands: 1,
  supplied: {
    type: SUPPLIED_TYPE_INTEGRATION,
    value: SUPPLIED_VALUE_DEFAULT_LOW,
    units: SUPPLIED_INTEGRATION_TIME_UNITS_H
  },
  spectralAveraging: 1,
  spectralResolution: '226.06 Hz (338.9 m/s)',
  effectiveResolution: '226.06 Hz (338.9 m/s)',
  zoomChannels: 1000
};

export const DEFAULT_PST_OBSERVATION_LOW_AA2: Observation = {
  id: 'obs-0000000',
  telescope: TELESCOPE_LOW_NUM,
  subarray: SA_AA2,
  linked: '0',
  type: TYPE_PST,
  observingBand: BAND_LOW_STR,
  centralFrequency: 200,
  centralFrequencyUnits: FREQUENCY_MHZ,
  continuumBandwidth: 150,
  continuumBandwidthUnits: FREQUENCY_MHZ,
  elevation: 15,
  bandwidth: null,
  numStations: 68,
  numSubBands: 1,
  supplied: {
    type: SUPPLIED_TYPE_INTEGRATION,
    value: SUPPLIED_VALUE_DEFAULT_LOW,
    units: SUPPLIED_INTEGRATION_TIME_UNITS_H
  },
  spectralAveraging: 1,
  spectralResolution: '',
  effectiveResolution: '',
  pstMode: FLOW_THROUGH_VALUE
};

export const DEFAULT_OBSERVATIONS_LOW_AA2: Observation[] = [
  DEFAULT_ZOOM_OBSERVATION_LOW_AA2,
  DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
  DEFAULT_PST_OBSERVATION_LOW_AA2
];

export const DUMMY_PROPOSAL_ID = 'dummy-proposal-id';

export const STATUS_ARRAY_PAGES_SV = [
  PAGE_TITLE_ADD,
  PAGE_TEAM,
  PAGE_DETAILS,
  PAGE_DESCRIPTION,
  PAGE_TARGET,
  PAGE_OBSERVATION,
  PAGE_DATA_PRODUCTS,
  PAGE_CALIBRATION
];

export const STATUS_ARRAY_PAGES_PROPOSAL = [
  PAGE_TITLE_ADD,
  PAGE_TEAM,
  PAGE_DETAILS,
  PAGE_DESCRIPTION,
  PAGE_TECHNICAL,
  PAGE_TARGET,
  PAGE_OBSERVATION,
  PAGE_DATA_PRODUCTS,
  PAGE_CALIBRATION,
  PAGE_LINKING
];

export const SV_LOW_AA2_CYCLE_NUMBER = 10000;
export const SV_LOW_MID_AA2_CYCLE_NUMBER = 1;
