import { ProposalAccessBackend } from '@/utils/types/proposalAccess';

const MockProposalBackendAccess: ProposalAccessBackend[] = [
  {
    prsl_id: 'prsl-t0001-20250814-00002',
    role: 'Principle Investigator',
    permissions: ['submit', 'update', 'view']
  }
];

export default MockProposalBackendAccess;
