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
  team: [
    {
      id: 1,
      firstName: 'Van Loo',
      lastName: 'Cheng',
      email: 'ask.lop@map.com',
      country: 'Lagoon',
      affiliation: 'University of Free Town',
      phdThesis: false,
      status: TEAM_STATUS_TYPE_OPTIONS.accepted,
      pi: true
    }
  ],
  abstract: '',
  category: 1,
  subCategory: 1,
  sciencePDF: null,
  scienceLoadStatus: false,
  targetOption: 1,
  targets: [
    {
      id: 1,
      name: 'Target 1',
      ra: '01:00:00',
      dec: '00:00:00',
      vel: '82.48'
    },
    {
      id: 2,
      name: 'Target 2',
      ra: '03:00:00',
      dec: '-10:00:00',
      vel: '82.48'
    },
    {
      id: 3,
      name: 'Target 3',
      ra: '05:30:00',
      dec: '-10:00:00',
      vel: '82.48'
    }
  ],
  observations: [
    {
      id: 1,
      telescope: 0,
      subarray: 0,
      type: 1
    },
    {
      id: 2,
      telescope: 0,
      subarray: 1,
      type: 0
    },
    {
      id: 3,
      telescope: 1,
      subarray: 1,
      type: 0
    },
    {
      id: 4,
      telescope: 1,
      subarray: 2,
      type: 1
    },
    {
      id: 5,
      telescope: 1,
      subarray: 3,
      type: 0
    }
  ],
  targetObservation: [
    { targetId: 1, observationId: 1 },
    { targetId: 3, observationId: 2 }
  ],
  technicalPDF: null,
  technicalLoadStatus: false,
  pipeline: ''
};

export default MockProposal;
