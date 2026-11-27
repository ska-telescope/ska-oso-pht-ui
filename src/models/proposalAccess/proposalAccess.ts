import ProposalAccess from '@utils/types/proposalAccess.tsx';
import type {
  ProposalAccess as ProposalAccessPDM,
  ProposalRole,
  ProposalPermissions
} from '@/generated/models';

// The access the ODA returns. Its responses for a user and for a proposal are typed separately
// (the one for a user leaves out the access and user IDs), so this is what the two have in common.
type ProposalAccessResponsePDM = Partial<ProposalAccessPDM> & {
  role: ProposalRole;
  permissions?: ProposalPermissions[];
};

export const proposalAccessFromPdm = (access: ProposalAccessResponsePDM): ProposalAccess => ({
  id: access.access_id as string,
  prslId: access.prsl_id?.toString() as string,
  userId: access.user_id as string,
  role: access.role,
  permissions: access.permissions as string[]
});

export const proposalAccessToPdm = (access: ProposalAccess): ProposalAccessPDM => ({
  access_id: access.id,
  prsl_id: access.prslId?.toString(),
  user_id: access.userId,
  role: access.role as ProposalRole,
  permissions: access.permissions as ProposalPermissions[]
});
