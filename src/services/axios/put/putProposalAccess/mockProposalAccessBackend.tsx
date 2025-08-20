import { PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';
import { ProposalAccessBackend } from '@/utils/types/proposalAccess';

const MockProposalBackendAccess: ProposalAccessBackend = {
  access_id: 'access-id-001',
  prsl_id: 'prsl-t0001-20250814-00002',
  user_id: 'user-id-001',
  role: PROPOSAL_ROLE_PI,
  permissions: PROPOSAL_ACCESS_PERMISSIONS
};

export default MockProposalBackendAccess;
