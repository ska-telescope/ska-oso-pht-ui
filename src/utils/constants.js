import { env } from '../../env';

export const SKA_PHT_API_URL = env.REACT_APP_SKA_PHT_API_URL;
export const USE_LOCAL_DATA = env.REACT_APP_USE_LOCAL_DATA === 'true';

export const EXISTING_PROPOSALS = [
  {
    id: 'SKA2388',
    title: 'The Milky Way View',
    cycle: 'SKA_5000_2023',
    pi: 'Van Loo Cheng',
    status: 'Submitted',
    lastUpdated: '2023-12-21 00:00:15',
    actions: null
  },
  {
    id: 'SKA2311',
    title: 'The Milky Way View',
    cycle: 'SKA_5000_2023',
    pi: 'Van Loo Cheng',
    status: 'Submitted',
    lastUpdated: '2023-12-20 00:00:15',
    actions: null
  },
  {
    id: 'SKA2399',
    title: 'The Giant HII in the Orion',
    cycle: 'SKA_5000_2023',
    pi: 'Keeper Sung',
    status: 'Accepted',
    lastUpdated: '2023-12-21 00:00:15',
    actions: null
  },
  {
    id: 'SKA2319',
    title: 'The Dancing Star',
    cycle: 'SKA_5000_2023',
    pi: 'Precious Luthan',
    status: 'Draft',
    lastUpdated: '2023-12-21 00:00:15',
    actions: null
  },
  {
    id: 'SKA2317',
    title: 'Ionization in the Spiral galaxy',
    cycle: 'SKA_5000_2023',
    pi: 'Ma James Nuka',
    status: 'Withdrawn',
    lastUpdated: '2023-12-21 00:00:15',
    actions: null
  }
];

export const STATUS_OK = 0;
export const STATUS_ERROR = 1;
export const STATUS_PARTIAL = 3;

export const PAGES = [
  'Title',
  'Team',
  'General',
  'Science',
  'Target',
  'Observation',
  'Technical',
  'Data'
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

export const TEAM = [
  {
    id: 1,
    FirstName: 'Van Loo',
    LastName: 'Cheng',
    Email: 'ask.lop@map.com',
    Country: 'Lagoon',
    Affiliation: 'University of Free Town',
    PHDThesis: false,
    Status: TEAM_STATUS_TYPE_OPTIONS.pending,
    Actions: null,
    PI: false
  },
  {
    id: 2,
    FirstName: 'Anu',
    LastName: 'Vijay',
    Email: 'ask.lop@map.com',
    Country: 'Ocean',
    Affiliation: 'University of Free Town',
    PHDThesis: true,
    Status: TEAM_STATUS_TYPE_OPTIONS.accepted,
    Actions: null,
    PI: true
  },
  {
    id: 3,
    FirstName: 'Sady',
    LastName: 'Field',
    Email: 'ask.lop@map.com',
    Country: 'Park',
    Affiliation: 'University of Virginia',
    PHDThesis: false,
    Status: TEAM_STATUS_TYPE_OPTIONS.accepted,
    Actions: null,
    PI: false
  }
];

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
    { label: 'Solar, Heliospheric and Ionospheric Physics', subCategory: [{ label: 'Not specified', value: 1 }], value: 12 },
    { label: 'Transients', subCategory: [{ label: 'Not specified', value: 1 }], value: 13 },
    { label: 'VLBI', subCategory: [{ label: 'Not specified', value: 1 }], value: 14 }
  ]
};

export const SCIENCE =
  "\n\n% This is a simple sample document.  For more complicated documents take a look in the exercise tab. Note that everything that comes after a % symbol is treated as comment and ignored when the code is compiled.\n\n\\documentclass{article} % \\documentclass{} is the first command in any LaTeX code.  It is used to define what kind of document you are creating such as an article or a book, and begins the document preamble\n\n\\usepackage{amsmath} % \\usepackage is a command that allows you to add functionality to your LaTeX code\n\n\\title{Simple Sample} % Sets article title\n\\author{My Name} % Sets authors name\n\\date{\\today} % Sets date for date compiled\n\n% The preamble ends with the command \\begin{document}\n\\begin{document} % All begin commands must be paired with an end command somewhere\n    \\maketitle % creates title using information in preamble (title, author, date)\n    \n    \\section{Hello World!} % creates a section\n    \n    \\textbf{Hello World!} Today I am learning \\LaTeX. %notice how the command will end at the first non-alphabet charecter such as the . after \\LaTeX\n     \\LaTeX{} is a great program for writing math. I can write in line math such as $a^2+b^2=c^2$ %$ tells LaTexX to compile as math\n     . I can also give equations their own space: \n    \\begin{equation} % Creates an equation environment and is compiled as math\n    \\gamma^2+\\theta^2=\\omega^2\n    \\end{equation}\n    If I do not leave any blank lines \\LaTeX{} will continue  this text without making it into a new paragraph.  Notice how there was no indentation in the text after equation (1).  \n    Also notice how even though I hit enter after that sentence and here $\\downarrow$\n     \\LaTeX{} formats the sentence without any break.  Also   look  how      it   doesn't     matter          how    many  spaces     I put     between       my    words.\n    \n    For a new paragraph I can leave a blank space in my code. \n\n\\end{document} % This is the end of the document\n";

export const TECHNICAL =
  "\n\n% This is a simple sample document.  For more complicated documents take a look in the exercise tab. Note that everything that comes after a % symbol is treated as comment and ignored when the code is compiled.\n\n\\documentclass{article} % \\documentclass{} is the first command in any LaTeX code.  It is used to define what kind of document you are creating such as an article or a book, and begins the document preamble\n\n\\usepackage{amsmath} % \\usepackage is a command that allows you to add functionality to your LaTeX code\n\n\\title{Simple Sample} % Sets article title\n\\author{My Name} % Sets authors name\n\\date{\\today} % Sets date for date compiled\n\n% The preamble ends with the command \\begin{document}\n\\begin{document} % All begin commands must be paired with an end command somewhere\n    \\maketitle % creates title using information in preamble (title, author, date)\n    \n    \\section{Hello World!} % creates a section\n    \n    \\textbf{Hello World!} Today I am learning \\LaTeX. %notice how the command will end at the first non-alphabet charecter such as the . after \\LaTeX\n     \\LaTeX{} is a great program for writing math. I can write in line math such as $a^2+b^2=c^2$ %$ tells LaTexX to compile as math\n     . I can also give equations their own space: \n    \\begin{equation} % Creates an equation environment and is compiled as math\n    \\gamma^2+\\theta^2=\\omega^2\n    \\end{equation}\n    If I do not leave any blank lines \\LaTeX{} will continue  this text without making it into a new paragraph.  Notice how there was no indentation in the text after equation (1).  \n    Also notice how even though I hit enter after that sentence and here $\\downarrow$\n     \\LaTeX{} formats the sentence without any break.  Also   look  how      it   doesn't     matter          how    many  spaces     I put     between       my    words.\n    \n    For a new paragraph I can leave a blank space in my code. \n\n\\end{document} % This is the end of the document\n";

export const DEFAULT_HELP = {
  title: 'Help Title',
  description: 'Field sensitive help',
  additional: ''
};

export const OBSERVATION = {
  list: [
    {
      id: '1',
      array: 'MID',
      subarray: 'subarray 1',
      linked: '4',
      type: 'Continuum'
    },
    {
      id: '2',
      array: 'MID',
      subarray: 'subarray 2',
      linked: '6',
      type: 'Zoom'
    },
    {
      id: '3',
      array: 'LOW',
      subarray: 'subarray 2',
      linked: '8',
      type: 'Zoom'
    },
    {
      id: '4',
      array: 'LOW',
      subarray: 'subarray 3',
      linked: '12',
      type: 'Continuum'
    },
    {
      id: '5',
      array: 'LOW',
      subarray: 'subarray 4',
      linked: '0',
      type: 'Zoom'
    }
  ],
  array: [
    {
      label: 'MID',
      value: 1,
      subarray: [
        { label: 'AA0.5', value: 1 },
        { label: 'AA1', value: 2 },
        { label: 'AA2', value: 3 },
        { label: 'AA* (15-m antennas only)', value: 4 },
        { label: 'AA4 (15-m antennas only)', value: 5 },
        { label: 'Custom', value: 6 }
      ],
      spectralAveraging: [
        { label: '1', value: 0 },
        { label: '2', value: 0 },
        { label: '3', value: 0 },
        { label: '4', value: 0 },
        { label: '6', value: 0 },
        { label: '8', value: 0 },
        { label: '12', value: 0 },
        { label: '24', value: 0 }
      ],
      band: [
        { label: 'Band 1 (0.35 - 1.05 GHz)', value: 1 },
        { label: 'Band 2 (0.95 - 1.76 GHz)', value: 2 },
        { label: 'Band 5a (4.6 - 8.5 GHz)', value: 3 },
        { label: 'Band 5b (8.3 - 15.4 GHz)', value: 4 }
      ],
      bandWidth: [
        { label: '3.125 MHz', value: 0 },
        { label: '6.25 MHz', value: 1 },
        { label: '12.5 Mhz', value: 2 },
        { label: '25 Mhz', value: 3 },
        { label: '50 Mhz', value: 4 },
        { label: '100 Mhz', value: 5 },
        { label: '200 Mhz', value: 6 }
      ]
    },
    {
      label: 'LOW',
      value: 2,
      spectralAveraging: [{ label: 'n/a', value: 0 }],
      subarray: [
        { label: 'AA0.5', value: 1 },
        { label: 'AA1', value: 2 },
        { label: 'AA2', value: 3 },
        { label: 'AA2 (core only)', value: 4 },
        { label: 'AA*', value: 5 },
        { label: 'AA* (core only)', value: 6 },
        { label: 'AA4', value: 7 },
        { label: 'AA4  (core only)', value: 8 },
        { label: 'Custom', value: 9 }
      ],
      band: null,
      bandWidth: [
        { label: '24.4 KHz', value: 0 },
        { label: '48.8 KHz', value: 1 },
        { label: '97.7 Khz', value: 2 },
        { label: '195.3 Khz', value: 3 },
        { label: '390.6 Khz', value: 4 },
        { label: '781.3 Khz', value: 5 },
        { label: '1562.5 Khz', value: 6 },
        { label: '3125.0 Khz', value: 7 }
      ]
    }
  ],
  ObservationType: [
    { label: 'Zoom', value: 0 },
    { label: 'Continuum', value: 1 }
  ],
  ImageWeighting: [
    { 
      label: 'Natural', 
      value: 0, 
      robust: [
        { label: 'n/a', value: 0 }
      ] 
    },
    { 
      label: 'Uniform', 
      value: 1, 
      robust: [
        { label: 'n/a', value: 0 }
      ]
    },
    { 
      label: 'Briggs', 
      value: 2, 
      robust: [
      { label: '-2', value: 0 },
      { label: '-1', value: 1 },
      { label: '0', value: 2 },
      { label: '1', value: 3 },
      { label: '2', value: 4 }
    ]
  }
  ],
  Tapering: [
    { label: 'No tapering', value: 0 },
    { label: '0.250"', value: 1 },
    { label: '1.000"', value: 2 },
    { label: '4.000"', value: 3 },
    { label: '16.000"', value: 4 },
    { label: '64.000"', value: 5 },
    { label: '256.000"', value: 6 },
    { label: '1024.000"', value: 7 }
  ],
  
  Supplied: [
    { 
      label: 'Integration Time', 
      value: 0, 
      units: [
        { label: 'd', value: 0 },
        { label: 'h', value: 1 },
        { label: 'min', value: 2 },
        { label: 's', value: 3 },
        { label: 'ms', value: 4 },
        { label: 'us', value: 5 },
        { label: 'ns', value: 6 }
      ]
    },
    { 
      label: 'Sensitivity', 
      value: 1,
      units: [
        { label: 'jy/beam', value: 0 },
        { label: 'mjy/beam', value: 1 },
        { label: 'ujy/beam', value: 2 },
        { label: 'njy/beam', value: 3 },
        { label: 'K', value: 4 },
        { label: 'mK', value: 5 },
        { label: 'uK', value: 6 } 
      ]
    }
  ],
  Units: [
    { label: 'Ghz', value: 0 }, 
    { label: 'Mhz', value: 1 }, 
    { label: 'Khz', value: 2 }, 
    { label: 'Hz', value: 3}
  ]
};

export const TARGETS = {
  'No Target': null,
  ListOfTargets: {
    AddTarget: ['Name', 'Right Ascension', 'Declination', 'Velocity / Redshift'],
    TargetItems: [
      {
        id: 1,
        Name: 'Target 1',
        RA: '01:00:00',
        Dec: '00:00:00',
        sc1: '82.48',
        sc2: '20',
        sc3: '34'
      },
      {
        id: 2,
        Name: 'Target 2',
        RA: '03:00:00',
        Dec: '-10:00:00',
        sc1: '82.48',
        sc2: '20',
        sc3: '34'
      },
      {
        id: 3,
        Name: 'Target 3',
        RA: '05:30:00',
        Dec: '-10:00:00',
        sc1: '82.48',
        sc2: '20',
        sc3: '34'
      }
    ]
  },
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
        title: 'Joint SKA proposal',
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
        id: 5,
        title: 'Target of opportunity',
        code: 'ToO',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 6,
        title: 'Joint SKA proposal',
        code: 'JTP',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 7,
        title: 'Coordinated Proposal',
        code: 'CP',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      },
      {
        id: 8,
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
        id: 9,
        title: 'Target of opportunity',
        code: 'ToO',
        description: 'A target of opportunity observing proposal'
      },
      {
        id: 10,
        title: 'Joint SKA proposal',
        code: 'JTP',
        description: 'A proposal that requires both SKA-MID and Low telescopes'
      },
      {
        id: 11,
        title: 'Coordinated Proposal',
        code: 'CP',
        description:
          'A proposal requiring observing to be coordinated with another facility (either ground- or space-based) with user-specified SCHEDULING CONSTRAINTS provided. Note VLBI is considered a form of coordinated observing, though later more detailed requirements may create a specific VLBI proposal type.'
      }
    ]
  }
];

export const MAX_TITLE_LENGTH = 50;

export const TITLE_ERROR_TEXT =
  'Invalid input: only alphanumeric characters, spaces, and some special characters are allowed.';
