import { ProposalBackend } from '../../../utils/types/proposal';

export const MockProposalBackend: ProposalBackend = {
  prsl_id: 'prsl-t0001-20250613-00002',
  status: 'draft',
  submitted_by: '',
  cycle: 'SKAO_2027_1',
  investigator_refs: [],
  info: {
    title: 'New Proposal',
    proposal_type: {
      main_type: 'standard_proposal',
      attributes: ['coordinated_proposal']
    },
    abstract: '',
    targets: [],
    documents: [],
    investigators: [],
    observation_sets: [],
    data_product_sdps: [],
    data_product_src_nets: [],
    result_details: []
  }
};
