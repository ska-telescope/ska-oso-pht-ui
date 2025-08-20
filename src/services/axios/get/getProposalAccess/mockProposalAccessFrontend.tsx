import { PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';
import ProposalAccess from '@/utils/types/proposalAccess';

const MockProposalAccessFrontend: ProposalAccess[] = [
  {
    id: 'access-id-001',
    prslId: 'prsl-t0001-20250814-00002',
    userId: 'user-id-001',
    role: PROPOSAL_ROLE_PI,
    permissions: PROPOSAL_ACCESS_PERMISSIONS
  }
];

export default MockProposalAccessFrontend;
