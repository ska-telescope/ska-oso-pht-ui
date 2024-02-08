import { env } from '../env';

export const SKA_PHT_API_URL = env.REACT_APP_SKA_PHT_API_URL;
export const SKA_PHT_URL = env.REACT_APP_SKA_PHT_URL;
export const USE_LOCAL_DATA = env.REACT_APP_USE_LOCAL_DATA;
export const SKA_SENSITIVITY_CALCULATOR_API_URL = env.REACT_APP_SKA_SENSITIVITY_CALC_URL;

export const STATUS_OK = 0;
export const STATUS_ERROR = 1;
export const STATUS_PARTIAL = 3;
export const STATUS_INITIAL = 5;

export const LAST_PAGE = 8;

export const NAV = [
  SKA_PHT_URL + '',
  SKA_PHT_URL + 'proposal/title',
  SKA_PHT_URL + 'proposal/team',
  SKA_PHT_URL + 'proposal/general',
  SKA_PHT_URL + 'proposal/science',
  SKA_PHT_URL + 'proposal/target',
  SKA_PHT_URL + 'proposal/observation',
  SKA_PHT_URL + 'proposal/technical',
  SKA_PHT_URL + 'proposal/data',
  SKA_PHT_URL + 'addProposal',
  SKA_PHT_URL + 'addObservation'
];

export const SEARCH_TYPE_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Rejected', value: 'rejected' }
];

export const TEAM_STATUS_TYPE_OPTIONS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected'
};

export const GENERAL = {
  Cycle: 'SKA_5000_2023',
  Abstract:
    'Lorem ipsum dolor sit amet, cu usu solum dictas, ad est sumo sonet. Pri ea aliquid corrumpit pertinacia, quando referrentur ei pri. Ad sea decore delenit, ea malorum minimum euripidis nam, ne facete recteque sit. Cu nisl ferri posidonium pri. Sit erroribus mediocritatem no, ipsum harum putent vim ad. Mel in quod tation doming, ius et wisi justo quaerendum. Cu eloquentiam liberavisse vis. Id rebum instructior eos, in veri erat per, vel at eius habeo salutatus. Cum dissentiunt mediocritatem ex, ut munere dicunt appareat sed, mel ea adhuc habemus elaboraret. Stet tota mentitum has cu, assum solet interpretaris mel ne, ei delectus scribentur comprehensam his. Unum tacimates est ne. Laudem dictas salutandi ne sea. Falli sanctus deterruisset ut nam. Has reque laudem at, in mea posse harum integre. An graeci deserunt neglegentur nec. Consul persecuti id sea. Mentitum liberavisse ex sit, no vix odio rebum volutpat. Error impedit ea est, duo modus blandit voluptatum ex. Usu cu convenire necessitatibus. Duo virtute denique in. Vis lorem solet mollis ad, autem aperiri principes et mea. Et diam ferri definitionem has, pri duis docendi cu, mutat nulla soleat qui ut. In meis invidunt principes sed. Regione malorum euismod no mel, vix ut natum laboramus mnesarchum. Alterum placerat forensibus cu ius. Vel magna maiestatis ut.',

  ScienceCategory: [
    { label: 'Cosmology', subCategory: [{ label: 'Not specified', value: 1 }], value: 1 },
    { label: 'Cradle of Life', subCategory: [{ label: 'Not specified', value: 1 }], value: 2 },
    {
      label: 'Epoch of Re-ionization',
      subCategory: [{ label: 'Not specified', value: 1 }],
      value: 3
    },
    {
      label: 'Extra Galactic continuum',
      subCategory: [{ label: 'Not specified', value: 1 }],
      value: 4
    },
    {
      label: 'Extra Galactic Spectral line',
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

export const DEFAULT_HELP = ['', ' ', ''];

export const OBSERVATION = {
  array: [
    {
      value: 1,
      subarray: [
        { value: 1 },
        { value: 2 },
        { value: 3 },
        { value: 4 },
        { value: 5 },
        { value: 6 }
      ],
      robust: [
        { label: '-2', value: 1 },
        { label: '-1', value: 2 },
        { label: '0', value: 3 },
        { label: '1', value: 4 },
        { label: '2', value: 5 }
      ],
      band: [
        { label: 'Band 1 (0.35 - 1.05 GHz)', value: 1 },
        { label: 'Band 2 (0.95 - 1.76 GHz)', value: 2 },
        { label: 'Band 5a (4.6 - 8.5 GHz)', value: 3 },
        { label: 'Band 5b (8.3 - 15.4 GHz)', value: 4 }
      ],
      bandWidth: [
        { label: '3.125 MHz', value: 1 },
        { label: '6.25 MHz', value: 2 },
        { label: '12.5 MHz', value: 3 },
        { label: '25 MHz', value: 4 },
        { label: '50 MHz', value: 5 },
        { label: '100 MHz', value: 6 },
        { label: '200 MHz', value: 7 }
      ],
      spectralResolution: [
        { label: '0.21 KHz', value: 1 },
        { label: '0.42 KHz', value: 2 },
        { label: '0.84 KHz', value: 3 },
        { label: '1.68 KHz', value: 4 },
        { label: '3.36 KHz', value: 5 },
        { label: '6.72 KHz', value: 6 },
        { label: '13.44 KHz', value: 7 }
      ]
    },
    {
      value: 2,
      subarray: [
        { value: 1 },
        { value: 2 },
        { value: 3 },
        { value: 4 },
        { value: 5 },
        { value: 6 },
        { value: 7 },
        { value: 8 },
        { value: 9 }
      ],
      robust: [{ value: 1 }],
      band: [{ label: 'Not applicable', value: 0 }],
      bandWidth: [
        { label: '24.4 KHz', value: 1 },
        { label: '48.8 KHz', value: 2 },
        { label: '97.7 KHz', value: 3 },
        { label: '195.3 KHz', value: 4 },
        { label: '390.6 KHz', value: 5 },
        { label: '781.3 KHz', value: 6 },
        { label: '1562.5 KHz', value: 7 },
        { label: '3125.0 KHz', value: 8 }
      ],
      spectralResolution: [
        { label: '14.1 Hz', value: 1 },
        { label: '28.3 Hz', value: 2 },
        { label: '56.5 Hz', value: 3 },
        { label: '113.0 Hz', value: 4 },
        { label: '226.1 Hz', value: 5 },
        { label: '452.1 Hz', value: 6 },
        { label: '904.2 Hz', value: 7 },
        { label: '1808.4 Hz', value: 8 }
      ]
    }
  ],
  ObservationType: [
    { label: 'Zoom', value: 0 },
    { label: 'Continuum', value: 1 }
  ],
  ImageWeighting: [
    { label: 'Natural', value: 0 },
    { label: 'Uniform', value: 1 },
    { label: 'Briggs', value: 2 }
  ],
  SpectralAveraging: [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '6', value: 6 },
    { label: '8', value: 8 },
    { label: '12', value: 12 },
    { label: '24', value: 24 }
  ],
  Tapering: [
    { label: 'No tapering', value: 1 },
    { label: '0.250"', value: 2 },
    { label: '1.000"', value: 3 },
    { label: '4.000"', value: 4 },
    { label: '16.000"', value: 5 },
    { label: '64.000"', value: 6 },
    { label: '256.000"', value: 7 },
    { label: '1024.000"', value: 8 }
  ],
  Supplied: [
    {
      label: 'Integration Time',
      value: 1,
      units: [
        { label: 'd', value: 1 },
        { label: 'h', value: 2 },
        { label: 'min', value: 3 },
        { label: 's', value: 4 },
        { label: 'ms', value: 5 },
        { label: 'us', value: 6 },
        { label: 'ns', value: 7 }
      ]
    },
    {
      label: 'Sensitivity',
      value: 2,
      units: [
        { label: 'jy/beam', value: 1 },
        { label: 'mjy/beam', value: 2 },
        { label: 'ujy/beam', value: 3 },
        { label: 'njy/beam', value: 4 },
        { label: 'K', value: 5 },
        { label: 'mK', value: 6 },
        { label: 'uK', value: 7 }
      ]
    }
  ],
  Units: [
    { label: 'GHz', value: 1 },
    { label: 'MHz', value: 2 },
    { label: 'KHz', value: 3 },
    { label: 'Hz', value: 4 }
  ]
};

export const TARGETS = {
  'No Target': null,
  'Create Mosaic': null
};

export const Projects = [
  {
    id: 1,
    title: 'Standard Proposal',
    code: 'PI',
    description: 'Standard Observing Proposal',
    subProjects: [
      {
        id: 1,
        title: 'Target of opportunity',
        code: 'ToO',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 2,
        title: 'Joint Telescope proposal',
        code: 'JTP',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 3,
        title: 'Coordinated Proposal',
        code: 'CP',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      },
      {
        id: 4,
        title: 'Long term proposal',
        code: 'LTP',
        description: 'A proposal that spans multiple PROPOSAL CYCLES'
      }
    ]
  },
  {
    id: 2,
    title: 'Key Science Project',
    code: 'KSP',
    description:
      'A large project that requires observing time allocations over a period longer than one cycle. This differs from a LTP as KSPs require a lot of observing time whereas LTPs typically need small amounts of time spread over more than one cycle',
    subProjects: [
      {
        id: 1,
        title: 'Target of opportunity',
        code: 'ToO',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 2,
        title: 'Joint Telescope proposal',
        code: 'JTP',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 3,
        title: 'Coordinated Proposal',
        code: 'CP',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      },
      {
        id: 4,
        title: 'Long term proposal',
        code: 'LTP',
        description: 'A proposal that spans multiple PROPOSAL CYCLES'
      }
    ]
  },
  {
    id: 3,
    title: "Director's Discretionary Time Proposal",
    code: 'DDT',
    description:
      "Director's discretionary time proposal. It does not follow the normal proposal submission policies. It only requires approval from DG.",
    subProjects: [
      {
        id: 1,
        title: 'Target of opportunity',
        code: 'ToO',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 2,
        title: 'Joint Telescope proposal',
        code: 'JTP',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 3,
        title: 'Coordinated Proposal',
        code: 'CP',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      }
    ]
  }
];

export const TEXT_ENTRY_PARAMS = {
  DEFAULT: {
    MAX_LENGTH: 50,
    ERROR_TEXT:
      'Invalid input: only alphanumeric characters, spaces, and some special characters are allowed.',
    PATTERN: /^[a-zA-Z0-9\s\-_:;&><#.,!"%*+='/]*$/
  },
  EMAIL: {
    MAX_LENGTH: 25,
    ERROR_TEXT: 'Please enter a valid email address.',
    // eslint-disable-next-line no-useless-escape
    PATTERN: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  }
};

export const EMPTY_PROPOSAL = {
  id: null,
  title: '',
  proposalType: 0,
  proposalSubType: 0,
  cycle: '',
  team: [],
  abstract: '',
  category: 0,
  subCategory: 0,
  sciencePDF: null,
  scienceLoadStatus: false,
  targetOption: 1,
  targets: [],
  observations: [],
  targetObservation: [],
  technicalPDF: null,
  technicalLoadStatus: false,
  pipeline: ''
};

export const DEFAULT_PI = {
  id: 1,
  firstName: 'Van Loo',
  lastName: 'Cheng',
  email: 'ask.lop@map.com',
  country: 'Lagoon',
  affiliation: 'University of Free Town',
  phdThesis: false,
  status: TEAM_STATUS_TYPE_OPTIONS.accepted,
  pi: true
};
