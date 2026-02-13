import { ProposalBackend } from '@utils/types/proposal.tsx';
import { PROPOSAL_STATUS } from '@/utils/constants';

const MockProposal: ProposalBackend[] = [
  {
    prsl_id: 'prp-test-20260213-00001',
    status: 'draft',
    submitted_by: '',
    metadata: {
      version: 1,
      created_by: 'a3e51298-97cd-4304-ab80-760ba440b93f',
      created_on: '2026-02-13T09:26:35.635130Z',
      last_modified_by: 'a3e51298-97cd-4304-ab80-760ba440b93f',
      last_modified_on: '2026-02-13T09:26:35.635130Z',
      pdm_version: '26.3.0'
    },
    cycle: 'CYCLE-003',
    proposal_info: {
      title: 'Proposal Title',
      proposal_type: {
        main_type: 'standard_proposal',
        attributes: ['target_of_opportunity']
      },
      abstract: '',
      science_category: '',
      investigators: [
        {
          user_id: 'a3e51298-97cd-4304-ab80-760ba440b93f',
          given_name: 'Chloe',
          family_name: 'Gallacher',
          email: 'Chloe.Gallacher@community.skao.int',
          for_phd: false,
          status: 'Accepted',
          principal_investigator: true
        }
      ]
    },
    observation_info: {}
  },
  {
    prsl_id: 'prp-test-20260213-00002',
    status: 'draft',
    submitted_by: '',
    metadata: {
      version: 1,
      created_by: 'a3e51298-97cd-4304-ab80-760ba440b93f',
      created_on: '2026-02-13T08:51:51.104026Z',
      last_modified_by: 'a3e51298-97cd-4304-ab80-760ba440b93f',
      last_modified_on: '2026-02-13T08:51:51.104026Z',
      pdm_version: '26.3.0'
    },
    cycle: 'SKAO_2027_1',
    proposal_info: {
      title: 'Science Verification Idea Title',
      proposal_type: {
        main_type: 'science_verification'
      },
      abstract: '',
      science_category: '',
      investigators: [
        {
          user_id: 'a3e51298-97cd-4304-ab80-760ba440b93f',
          given_name: 'Chloe',
          family_name: 'Gallacher',
          email: 'Chloe.Gallacher@community.skao.int',
          for_phd: false,
          status: 'Accepted',
          principal_investigator: true
        }
      ]
    },
    observation_info: {}
  }
];

export default MockProposal;
