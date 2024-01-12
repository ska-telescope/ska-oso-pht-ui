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
  // General
  abstract: '',
  category: 1,
  subCategory: 1,
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
  ]
};

export default MockProposal;
