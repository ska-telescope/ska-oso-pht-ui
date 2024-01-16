const TEAM_STATUS_TYPE_OPTIONS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected'
};

const MockProposal = {
  id: 1,
  title: 'MOCK PROPOSAL',
  proposalType: 1,
  proposalSubType: 5,
  // Team
  team: [
    {
      id: 1,
      firstName: 'Van Loo',
      lastName: 'Cheng',
      email: 'ask.lop@map.com',
      country: 'Lagoon',
      affiliation: 'University of Free Town',
      phdThesis: false,
      status: TEAM_STATUS_TYPE_OPTIONS.pending,
      actions: null,
      pi: false
    },
    {
      id: 2,
      firstName: 'Anu',
      lastName: 'Vijay',
      email: 'ask.lop@map.com',
      country: 'Ocean',
      affiliation: 'University of Free Town',
      phdThesis: true,
      status: TEAM_STATUS_TYPE_OPTIONS.accepted,
      actions: null,
      pi: true
    },
    {
      id: 3,
      firstName: 'Sady',
      lastName: 'Field',
      email: 'ask.lop@map.com',
      country: 'Park',
      affiliation: 'University of Virginia',
      phdThesis: false,
      status: TEAM_STATUS_TYPE_OPTIONS.accepted,
      actions: null,
      pi: false
    }
  ],
  // General
  abstract: '',
  category: 1,
  subCategory: 1,
  // Science,
  sciencePDF: null,
  // Target
  targetOption: 1,
  targets: [
    {
      id: 1,
      name: 'Target 1',
      ra: '01:00:00',
      dec: '00:00:00',
      sc1: '82.48',
      sc2: '20',
      sc3: '34'
    },
    {
      id: 2,
      name: 'Target 2',
      ra: '03:00:00',
      dec: '-10:00:00',
      sc1: '82.48',
      sc2: '20',
      sc3: '34'
    },
    {
      id: 3,
      name: 'Target 3',
      ra: '05:30:00',
      dec: '-10:00:00',
      sc1: '82.48',
      sc2: '20',
      sc3: '34'
    }
  ],
  // Observation
  observations: [
    {
      id: 1,
      array: 'MID',
      subarray: 'subarray 1',
      linked: '4',
      type: 'Continuum'
    },
    {
      id: 2,
      array: 'MID',
      subarray: 'subarray 2',
      linked: '6',
      type: 'Zoom'
    },
    {
      id: 3,
      array: 'LOW',
      subarray: 'subarray 2',
      linked: '8',
      type: 'Zoom'
    },
    {
      id: 4,
      array: 'LOW',
      subarray: 'subarray 3',
      linked: '12',
      type: 'Continuum'
    },
    {
      id: 5,
      array: 'LOW',
      subarray: 'subarray 4',
      linked: '0',
      type: 'Zoom'
    }
  ],
  // Technical,
  technicalPDF: null,
  // Data
  pipeline: ''
};

export default MockProposal;
