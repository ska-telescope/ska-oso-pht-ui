import { ProposalBackend } from '@utils/types/proposal.tsx';

export const MockProposalBackend: ProposalBackend = {
  prsl_id: 'prsl-t0001-20250613-00002',
  status: 'draft',
  submitted_by: '',
  submitted_on: null,
  cycle: 'SKAO_2027_1',
  investigator_refs: [],
  proposal_info: {
    title: 'New Proposal',
    proposal_type: {
      main_type: 'standard_proposal',
      attributes: ['coordinated_proposal']
    },
    abstract: '',
    investigators: []
  },
  observation_info: {
    targets: [],
    documents: [],
    observation_sets: [],
    data_product_sdps: [],
    data_product_src_nets: [],
    result_details: [],
    calibration_strategy: []
  }
};
