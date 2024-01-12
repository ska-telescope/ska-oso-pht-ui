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
  ],
  // General
  abstract: '',
  category: 1,
  subCategory: 1,
  // Target
  targetOption: 1,
  targets: [
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
};

export default MockProposal;
