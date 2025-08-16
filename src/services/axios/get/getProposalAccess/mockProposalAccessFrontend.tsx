import ProposalAccess from '@/utils/types/proposalAccess';

const MockProposalAccessFrontend: ProposalAccess[] = [
  {
    id: 'access-id-001',
    prslId: 'prsl-t0001-20250814-00002',
    userId: 'user-id-001',
    role: 'Principle Investigator',
    permissions: ['submit', 'update', 'view']
  }
];

export default MockProposalAccessFrontend;
