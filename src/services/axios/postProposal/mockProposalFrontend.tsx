import Proposal from '@/utils/types/proposal';

export const MockProposalFrontend: Proposal = {
  id: 'prsl-t0001-20250613-00002',
  title: 'New Proposal',
  proposalType: 1,
  proposalSubType: [3],
  status: 'draft',
  lastUpdated: '2025-06-24T16:48:47.127032Z',
  lastUpdatedBy: 'DefaultUser',
  createdOn: '2025-06-13T13:48:34.963103Z',
  createdBy: 'DefaultUser',
  version: 10,
  cycle: 'SKA_1962_2024',
  team: [],
  abstract: 'My scienceTest abstract',
  scienceCategory: 1,
  scienceSubCategory: [1],
  sciencePDF: null,
  targets: [],
  observations: [],
  groupObservations: [],
  targetObservation: [],
  technicalPDF: null,
  dataProductSDP: [],
  dataProductSRC: []
};
