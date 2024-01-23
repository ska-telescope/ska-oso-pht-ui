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
      actions: null,
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
      actions: null,
      name: 'Target 1',
      ra: '01:00:00',
      dec: '00:00:00',
      vel: '82.48'
    },
    {
      id: 2,
      actions: null,
      name: 'Target 2',
      ra: '03:00:00',
      dec: '-10:00:00',
      vel: '82.48'
    },
    {
      id: 3,
      actions: null,
      name: 'Target 3',
      ra: '05:30:00',
      dec: '-10:00:00',
      vel: '82.48'
    }
  ],
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
  targetObservation: [
    { targetId: 1, observationId: 1 },
    { targetId: 3, observationId: 2 }
  ],
  technicalPDF: null,
  technicalLoadStatus: false,
  pipeline: ''
};

export default MockProposal;
