import { ProposalAccessBackend } from '@/utils/types/proposalAccess';

const MockProposalBackendAccess: ProposalAccessBackend = {
  access_id: 'access-id-001',
  prsl_id: 'prsl-t0001-20250814-00002',
  user_id: 'user-id-001',
  role: 'Principle Investigator',
  permissions: ['submit', 'update', 'view']
};

export default MockProposalBackendAccess;
