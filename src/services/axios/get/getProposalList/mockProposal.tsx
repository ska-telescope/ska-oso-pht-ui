import { ProposalBackend } from '@utils/types/proposal.tsx';

const MockProposal: ProposalBackend[] = [
  {
    "prsl_id": "prsl-test-20250814-00003",
    "status": "draft",
    "submitted_by": "",
    "metadata": {
      "version": 2,
      "created_by": "Cypress Default User",
      "created_on": "2025-08-15T14:11:33.237283Z",
      "last_modified_by": "a3e51298-97cd-4304-ab80-760ba440b93f",
      "last_modified_on": "2025-08-15T14:11:33.248432Z",
      "pdm_version": "19.1.0"
    },
    "cycle": "SKAO_2027_1",
    "info": {
      "title": "Proposal Title",
      "proposal_type": {
        "main_type": "standard_proposal",
        "sub_type": "target_of_opportunity"
      },
      "abstract": ""
    }
  }
];
export default MockProposal;
