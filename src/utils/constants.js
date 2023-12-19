export const EXISTING_PROPOSALS = [
  {
    id: 'SKA2388',
    title: 'The Milky Way View',
    cycle: 'SKA_5000_2023',
    pi: 'Van Loo Cheng',
    status: 'Submitted',
    lastUpdated: '21/11/2023',
    actions: null
  },
  {
    id: 'SKA2311',
    title: 'The Milky Way View',
    cycle: 'SKA_5000_2023',
    pi: 'Van Loo Cheng',
    status: 'Submitted',
    lastUpdated: '21/11/2023',
    actions: null
  },
  {
    id: 'SKA2399',
    title: 'The Giant HII in the Orion',
    cycle: 'SKA_5000_2023',
    pi: 'Keeper Sung',
    status: 'Accepted',
    lastUpdated: '1/11/2023',
    actions: null
  },
  {
    id: 'SKA2319',
    title: 'The Dancing Star',
    cycle: 'SKA_5000_2023',
    pi: 'Precious Luthan',
    status: 'Draft',
    lastUpdated: '21/12/2022',
    actions: null
  },
  {
    id: 'SKA2317',
    title: 'Ionization in the Spiral galaxy',
    cycle: 'SKA_5000_2023',
    pi: 'Ma James Nuka',
    status: 'Withdrawn',
    lastUpdated: '21/01/2023',
    actions: null
  }
];

export const PAGES = [
  { status: 0, title: 'title' },
  { status: 0, title: 'team' },
  { status: 1, title: 'general' },
  { status: 3, title: 'science' },
  { status: 3, title: 'target' },
  { status: 5, title: 'Observation' },
  { status: 5, title: 'Technical' },
  { status: 5, title: 'Data' }
];

export const SEARCH_TYPE_OPTIONS = [
  { label: 'Created', value: 'created' },
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Rejected', value: 'rejected' }
];

export const TEAM = [
  {
    id: 1,
    FirstName: 'Van Loo',
    LastName: 'Cheng',
    Email: 'ask.lop@map.com',
    Country: 'Lagoon',
    Affiliation: 'University of Free Town',
    'For PhD Thesis?': 'No'
  },
  {
    id: 2,
    FirstName: 'Anu',
    LastName: 'Vijay',
    Email: 'ask.lop@map.com',
    Country: 'Ocean',
    Affiliation: 'University of Free Town',
    'For PhD Thesis?': 'Yes'
  },
  {
    id: 3,
    FirstName: 'Sady',
    LastName: 'Field',
    Email: 'ask.lop@map.com',
    Country: 'Park',
    Affiliation: 'University of Virginia',
    'For PhD Thesis?': 'No'
  }
];

export const GENERAL = {
  Cycle: 'SKA_5000_2023',
  Abstract:
    'Lorem ipsum dolor sit amet, cu usu solum dictas, ad est sumo sonet. Pri ea aliquid corrumpit pertinacia, quando referrentur ei pri. Ad sea decore delenit, ea malorum minimum euripidis nam, ne facete recteque sit. Cu nisl ferri posidonium pri. Sit erroribus mediocritatem no, ipsum harum putent vim ad. Mel in quod tation doming, ius et wisi justo quaerendum. Cu eloquentiam liberavisse vis. Id rebum instructior eos, in veri erat per, vel at eius habeo salutatus. Cum dissentiunt mediocritatem ex, ut munere dicunt appareat sed, mel ea adhuc habemus elaboraret. Stet tota mentitum has cu, assum solet interpretaris mel ne, ei delectus scribentur comprehensam his. Unum tacimates est ne. Laudem dictas salutandi ne sea. Falli sanctus deterruisset ut nam. Has reque laudem at, in mea posse harum integre. An graeci deserunt neglegentur nec. Consul persecuti id sea. Mentitum liberavisse ex sit, no vix odio rebum volutpat. Error impedit ea est, duo modus blandit voluptatum ex. Usu cu convenire necessitatibus. Duo virtute denique in. Vis lorem solet mollis ad, autem aperiri principes et mea. Et diam ferri definitionem has, pri duis docendi cu, mutat nulla soleat qui ut. In meis invidunt principes sed. Regione malorum euismod no mel, vix ut natum laboramus mnesarchum. Alterum placerat forensibus cu ius. Vel magna maiestatis ut.',
  ScienceCategory: [
    { label: 'Cosmology', value: 1 },
    { label: 'Cradle of Life', value: 2 },
    { label: 'Epoch of Re-ionization', value: 3 },
    { label: 'Extra Galactic continuum', value: 4 },
    { label: 'Extra Galactic Spectral line', value: 5 },
    { label: 'Gravitational Waves', value: 6 },
    { label: 'High Energy Cosmic Particles', value: 7 },
    { label: 'HI Galaxy science', value: 8 },
    { label: 'Magnetism', value: 9 },
    { label: 'Our Galaxy', value: 10 },
    { label: 'Pulsars', value: 11 },
    { label: 'Solar, Heliospheric and Ionospheric Physics', value: 12 },
    { label: 'Transients', value: 13 },
    { label: 'VLBI', value: 14 }
  ],
  ScienceSubCategory: [{ label: 'Not specified', value: 1 }]
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
      band: [
        { label: 'Band 1 (0.35 - 1.05 GHz)', value: 1 },
        { label: 'Band 2 (0.95 - 1.76 GHz)', value: 2 },
        { label: 'Band 5a (4.6 - 8.5 GHz)', value: 3 },
        { label: 'Band 5b (8.3 - 15.4 GHz)', value: 4 }
      ]
    },
    {
      label: 'LOW',
      value: 2,
      subarray: [
        { label: 'AA0.5', value: 1 },
        { label: 'AA1', value: 2 },
        { label: 'AA2', value: 3 }
      ],
      band: null
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
  Bandwidth: {
    MID: [],
    LOW: []
  }
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
