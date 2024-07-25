import { env } from '../env';
import { LABEL_POSITION, TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';

export const USE_LOCAL_DATA = env.REACT_APP_USE_LOCAL_DATA === 'true';
export const USE_LOCAL_DATA_SENSITIVITY_CALC =
  env.REACT_APP_USE_LOCAL_DATA_SENSITIVITY_CALC === 'true';
export const SKA_PHT_API_URL = env.REACT_APP_SKA_PHT_API_URL;
export const SKA_SENSITIVITY_CALCULATOR_API_URL = env.REACT_APP_SKA_SENSITIVITY_CALC_URL;

/*****************************************/

export const AXIOS_CONFIG = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};

export const BANDWIDTH_TELESCOPE = [
  {
    label: 'Low Band (50 - 350 MHz)',
    telescope: 2,
    value: 0,
    isBand5: false,
    lower: 50,
    upper: 350,
    units: 'MHz'
  },
  {
    label: 'Band 1 (0.35 - 1.05 GHz)',
    telescope: 1,
    value: 1,
    isBand5: false,
    lower: 0.35,
    upper: 1.05,
    units: 'GHz'
  }, // Band 1
  {
    label: 'Band 2 (0.95 - 1.76 GHz)',
    telescope: 1,
    value: 2,
    isBand5: false,
    lower: 0.95,
    upper: 1.76,
    units: 'GHz'
  }, // Band 2
  {
    label: 'Band 5a (4.6 - 8.5 GHz)',
    telescope: 1,
    value: 3,
    isBand5: true,
    lower: 4.6,
    upper: 8.5,
    units: 'GHz'
  }, // Band 5a
  {
    label: 'Band 5b (8.3 - 15.4 GHz)',
    telescope: 1,
    value: 4,
    isBand5: true,
    lower: 8.3,
    upper: 15.4,
    units: 'GHz'
  } // Band 5b
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

export const EMPTY_STATUS = [5, 5, 5, 5, 5, 5, 5, 5, 5];
export const ENTRY_HEIGHT = 40;

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

export const NOTSPECIFIED = 'notSpecified';

export const IMAGE_SIZE_UNITS = {
  ARCSECS: 'arcseconds',
  ARCMINS: 'arcmins',
  DEGREES: 'degrees'
};

export const LAB_IS_BOLD = true;
export const LAB_POSITION = LABEL_POSITION.START;
export const LAST_PAGE = 9;

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

export const PATH = ['/', '/addProposal', '/addObservation', '/addDataProduct', '/editObservation'];
export const Projects = [
  {
    id: 1,
    title: 'Standard Proposal',
    code: 'PI',
    mapping: 'standard_proposal',
    description: 'Standard Observing Proposal',
    subProjects: [
      {
        id: 1,
        title: 'Target of opportunity',
        code: 'ToO',
        mapping: 'target_of_opportunity',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 2,
        title: 'Joint proposal',
        code: 'JSP',
        mapping: 'joint_proposal',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 3,
        title: 'Coordinated Proposal',
        code: 'CP',
        mapping: 'coordinated_proposal',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      },
      {
        id: 4,
        title: 'Long term proposal',
        code: 'LTP',
        mapping: 'long_term_proposal',
        description: 'A proposal that spans multiple PROPOSAL CYCLES'
      }
    ]
  },
  {
    id: 2,
    title: 'Key Science Project',
    code: 'KSP',
    mapping: 'key_science_proposal',
    description:
      'A large project that requires observing time allocations over a period longer than one cycle. This differs from a LTP as KSPs require a lot of observing time whereas LTPs typically need small amounts of time spread over more than one cycle',
    subProjects: [
      {
        id: 1,
        title: 'Target of opportunity',
        code: 'ToO',
        mapping: 'target_of_opportunity',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 2,
        title: 'Joint proposal',
        code: 'JSP',
        mapping: 'joint_proposal',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 3,
        title: 'Coordinated Proposal',
        code: 'CP',
        mapping: 'coordinated_proposal',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      },
      {
        id: 4,
        title: 'Long term proposal',
        code: 'LTP',
        mapping: 'long_term_proposal',
        description: 'A proposal that spans multiple PROPOSAL CYCLES'
      }
    ]
  },
  {
    id: 3,
    title: "Director's Discretionary Time Proposal",
    code: 'DDT',
    mapping: 'director_time_proposal',
    description:
      "Director's discretionary time proposal. It does not follow the normal proposal submission policies. It only requires approval from DG.",
    subProjects: [
      {
        id: 1,
        title: 'Target of opportunity',
        code: 'ToO',
        mapping: 'target_of_opportunity',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 2,
        title: 'Joint proposal',
        code: 'JSP',
        mapping: 'joint_proposal',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 3,
        title: 'Coordinated Proposal',
        code: 'CP',
        mapping: 'coordinated_proposal',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
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

export const TYPE_ZOOM = 0;
export const TYPE_CONTINUUM = 1;
export const OBS_TYPES = ['spectral', 'continuum'];
export const OBSERVATION_TYPE = [TYPE_ZOOM, TYPE_CONTINUUM];
export const OBSERVATION_TYPE_BACKEND = ['Zoom', 'Continuum'];
export const OBSERVATION_TYPE_SENSCALC = ['line', 'continuum'];
export const OBSERVATION = {
  array: [
    {
      value: 1,
      subarray: [
        // MID
        {
          value: 1,
          map: 'AA0.5',
          label: 'AA0.5',
          numOf15mAntennas: 4,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: 2,
          map: 'AA1',
          label: 'AA1',
          numOf15mAntennas: 8,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: 3,
          map: 'AA2',
          label: 'AA2',
          numOf15mAntennas: 64,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: 5,
          map: 'AA*',
          label: 'AA*',
          numOf15mAntennas: 80,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: true
        },
        {
          value: 6,
          map: 'AA* (15-m antennas only)',
          label: 'AA* (15-m antennas only)',
          numOf15mAntennas: 80,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: 8,
          map: 'AA4',
          label: 'AA4',
          numOf15mAntennas: 133,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: true
        },
        {
          value: 9,
          map: 'AA4 (15-m antennas only)',
          label: 'AA4 (15-m antennas only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: false
        },
        {
          value: 10,
          map: 'AA*/AA4 (13.5-m antennas only)',
          label: 'AA*/AA4 (13.5-m antennas only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 64,
          numOfStations: 0,
          disableForBand5: true
        },
        {
          value: 20,
          map: 'Custom',
          label: 'Custom',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        }
      ],
      robust: [
        { label: '-2', value: 1 },
        { label: '-1', value: 2 },
        { label: '0', value: 3 },
        { label: '1', value: 4 },
        { label: '2', value: 5 }
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
      CentralFrequencyAndBandWidthUnits: [
        { label: 'GHz', value: 1 },
        { label: 'MHz', value: 2 },
        { label: 'KHz', value: 3 },
        { label: 'Hz', value: 4 }
      ]
    },
    {
      value: 2,
      subarray: [
        // LOW
        {
          value: 1,
          map: 'LOW_AA05_all',
          label: 'AA0.5',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 6,
          disableForBand5: false
        },
        {
          value: 2,
          map: 'LOW_AA1_all',
          label: 'AA1',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 18,
          disableForBand5: false
        },
        {
          value: 3,
          map: 'LOW_AA2_all',
          label: 'AA2',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 64,
          disableForBand5: false
        },
        {
          value: 4,
          map: 'LOW_AA2_core_all',
          label: 'AA2 (core only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 40,
          disableForBand5: false
        },
        {
          value: 5,
          map: 'LOW_AAstar_all',
          label: 'AA*',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 307,
          disableForBand5: false
        },
        {
          value: 7,
          map: 'LOW_AAstar_core_all',
          label: 'AA* (core only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 199,
          disableForBand5: false
        },
        {
          value: 8,
          map: 'LOW_AA4_all',
          label: 'AA4',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 512,
          disableForBand5: false
        },
        {
          value: 11,
          map: 'LOW_AA4_core_all',
          label: 'AA4 (core only)',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 224,
          disableForBand5: false
        },
        {
          value: 20,
          map: 'Custom',
          label: 'Custom',
          numOf15mAntennas: 0,
          numOf13mAntennas: 0,
          numOfStations: 0,
          disableForBand5: false
        }
      ],
      robust: [{ label: '', value: 1 }], // TODO: should be like above: -2 to 2
      bandWidth: [
        { label: '24.4 KHz', value: 1 },
        { label: '48.8 KHz', value: 2 },
        { label: '97.7 KHz', value: 3 },
        { label: '195.3 KHz', value: 4 },
        { label: '390.6 KHz', value: 5 },
        { label: '781.2 KHz', value: 6 },
        { label: '1562.5 KHz', value: 7 },
        { label: '3125.0 KHz', value: 8 }
      ],
      CentralFrequencyAndBandWidthUnits: [{ label: 'MHz', value: 1 }]
    }
  ],
  ImageWeighting: [
    { label: 'Natural', value: 0 },
    { label: 'Uniform', value: 1 },
    { label: 'Briggs', value: 2 }
  ],
  SpectralAveraging: [
    { label: '1', value: 1, lookup: 0 },
    { label: '2', value: 2, lookup: 1 },
    { label: '3', value: 3, lookup: 2 },
    { label: '4', value: 4, lookup: 3 },
    { label: '6', value: 6, lookup: 4 },
    { label: '8', value: 8, lookup: 5 },
    { label: '12', value: 12, lookup: 6 },
    { label: '24', value: 24, lookup: 7 }
  ],
  CentralFrequencyOBLow: [{ lookup: 0, value: '200' }],
  CentralFrequencyOB1: [
    { lookup: 1, label: 'AA0.5', value: '0.7' },
    { lookup: 2, label: 'AA1', value: '0.7' },
    { lookup: 3, label: 'AA2', value: '0.7' },
    { lookup: 5, label: 'AA*', value: '0.7975' },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: '0.7' },
    { lookup: 8, label: 'AA4', value: '0.7975' },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: '0.7' },
    { lookup: 10, label: 'AA*/AA4 (13.5-m antennas only)', value: '0.7975' },
    { lookup: 20, label: 'Custom', value: '0.7975' }
  ],
  CentralFrequencyOB2: [
    { lookup: 1, label: 'AA0.5', value: '1.355' },
    { lookup: 2, label: 'AA1', value: '1.355' },
    { lookup: 3, label: 'AA2', value: '1.355' },
    { lookup: 5, label: 'AA*', value: '1.31' },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: '1.355' },
    { lookup: 8, label: 'AA4', value: '1.31' },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: '1.355' },
    { lookup: 10, label: 'AA*/AA4 (13.5-m antennas only)', value: '1.31' },
    { lookup: 20, label: 'Custom', value: '1.31' }
  ],
  CentralFrequencyOB5a: [{ value: '6.55' }],
  CentralFrequencyOB5b: [{ value: '11.85' }],
  ContinuumBandwidthOBLow: [
    { lookup: 1, label: 'AA0.5', value: '75' },
    { lookup: 2, label: 'AA1', value: '75' },
    { lookup: 3, label: 'AA2', value: '150' },
    { lookup: 4, label: 'AA2 (core only)', value: '150' },
    { lookup: 5, label: 'AA*', value: '300' },
    { lookup: 7, label: 'AA* (core only)', value: '300' },
    { lookup: 8, label: 'AA4', value: '300' },
    { lookup: 11, label: 'AA4 (core only)', value: '300' },
    { lookup: 20, label: 'Custom', value: '300' }
  ],
  ContinuumBandwidthOB1: [
    { lookup: 1, label: 'AA0.5', value: '0.7' },
    { lookup: 2, label: 'AA1', value: '0.7' },
    { lookup: 3, label: 'AA2', value: '0.7' },
    { lookup: 5, label: 'AA*', value: '0.435' },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: '0.7' },
    { lookup: 8, label: 'AA4', value: '0.435' },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: '0.7' },
    { lookup: 10, label: 'AA*/AA4 (13.5-m antennas only)', value: '0.435' },
    { lookup: 20, label: 'Custom', value: '0.435' }
  ],
  ContinuumBandwidthOB2: [
    { lookup: 1, label: 'AA0.5', value: '0.8' },
    { lookup: 2, label: 'AA1', value: '0.8' },
    { lookup: 3, label: 'AA2', value: '0.8' },
    { lookup: 5, label: 'AA*', value: '0.72' },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: '0.81' },
    { lookup: 8, label: 'AA4', value: '0.72' },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: '0.81' },
    { lookup: 10, label: 'AA*/AA4 (13.5-m antennas only)', value: '0.72' },
    { lookup: 20, label: 'Custom', value: '0.72' }
  ],
  ContinuumBandwidthOB5a: [
    { lookup: 1, label: 'AA0.5', value: '0.8' },
    { lookup: 2, label: 'AA1', value: '0.8' },
    { lookup: 3, label: 'AA2', value: '0.8' },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: '3.9' },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: '3.9' },
    { lookup: 20, label: 'Custom', value: '3.9' }
  ],
  ContinuumBandwidthOB5b: [
    { lookup: 1, label: 'AA0.5', value: '0.8' },
    { lookup: 2, label: 'AA1', value: '0.8' },
    { lookup: 3, label: 'AA2', value: '0.8' },
    { lookup: 6, label: 'AA* (15-m antennas only)', value: '5' },
    { lookup: 9, label: 'AA4 (15-m antennas only)', value: '5' },
    { lookup: 20, label: 'Custom', value: '5' }
  ],
  SpectralResolutionObLow: [{ value: '5.43 kHz (8.1 km/s)' }],
  SpectralResolutionOb1: [
    { lookup: '0.7', value: '13.44 kHz (5.8 km/s)' },
    { lookup: '0.7975', value: '13.44 kHz (5.1 km/s)' }
  ],
  SpectralResolutionOb2: [
    { lookup: '1.355', value: '13.44 kHz (3.0 km/s)' },
    { lookup: '1.31', value: '13.44 kHz (3.1 km/s)' }
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
      label: 'Integration Time', // TODO check if label still needed as we use sensCalcResultsLabel in calculate results
      sensCalcResultsLabel: 'integrationTime',
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
      sensCalcResultsLabel: 'sensitivity', // TODO check if label still needed as we use sensCalcResultsLabel in calculate results
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

export const RA_TYPE_EQUATORIAL = 0;
export const RA_TYPE_GALACTIC = 1;

export const VEL_TYPES = [
  { label: 'Velocity', value: 0 },
  { label: 'Redshift', value: 1 }
];

export const VEL_UNITS = [
   { label: 'km/s', value: 0},
   { label: 'm/s', value: 1}
]

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
]

export const SEARCH_TYPE_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Rejected', value: 'rejected' }
];
export const STATUS_OK = 0;
export const STATUS_ERROR = 1;
export const STATUS_PARTIAL = 3;
export const STATUS_INITIAL = 5;
export const STATUS = {
  OK: STATUS_OK,
  ERROR: STATUS_ERROR,
  PARTIAL: STATUS_PARTIAL,
  INITIAL: STATUS_INITIAL
};

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
export const TELESCOPE_LOW_NUM = 2;
export const TELESCOPES = [
  { label: TELESCOPE_MID.code.toUpperCase(), value: 1 },
  { label: TELESCOPE_LOW.code.toUpperCase(), value: 2 }
];

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

/**************************************************************8*/

export const DEFAULT_PI = {
  id: 'prp-ska01-202204-01',
  firstName: 'Van Loo',
  lastName: 'Cheng',
  email: 'ask.lop@map.com',
  country: 'Lagoon',
  affiliation: 'University of Free Town',
  phdThesis: false,
  status: TEAM_STATUS_TYPE_OPTIONS.accepted,
  pi: true
};

export const EMPTY_PROPOSAL = {
  id: null,
  title: '',
  proposalType: 0,
  proposalSubType: [0],
  cycle: '',
  team: [DEFAULT_PI],
  abstract: '',
  category: 0,
  subCategory: [0],
  sciencePDF: null,
  scienceLoadStatus: 0,
  targetOption: 1,
  targets: [],
  observations: [],
  groupObservations: [],
  targetObservation: [],
  technicalPDF: null,
  technicalLoadStatus: 0,
  dataProducts: [],
  pipeline: ''
};
