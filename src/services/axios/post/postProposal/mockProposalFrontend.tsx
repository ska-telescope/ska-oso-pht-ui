import { DEFAULT_USER, PROPOSAL_STATUS } from '@utils/constants.ts';
import Proposal from '@utils/types/proposal.tsx';

export const MockProposalFrontend: Proposal = {
  id: 'prsl-t0001-20250613-00002',
  title: 'New Proposal',
  proposalType: 1,
  proposalSubType: [3],
  status: PROPOSAL_STATUS.DRAFT,
  lastUpdated: '2025-06-24T16:48:47.127032Z',
  lastUpdatedBy: DEFAULT_USER,
  createdOn: '2025-06-13T13:48:34.963103Z',
  createdBy: DEFAULT_USER,
  version: 10,
  cycle: 'SKAO_2027_1',
  investigators: [],
  abstract: '',
  scienceCategory: null,
  scienceSubCategory: [1],
  sciencePDF: null,
  targets: [],
  observations: [],
  groupObservations: [],
  targetObservation: [],
  technicalPDF: null,
  dataProductSDP: [],
  dataProductSRC: [],
  calibrationStrategy: []
};
