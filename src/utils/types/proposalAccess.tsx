import { Metadata } from './metadata';
import { PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';

export type ProposalAccessBackend = {
  access_id: string;
  prsl_id: string;
  user_id: string;
  role: string;
  permissions: string[];
  metaData?: Metadata;
};

export type ProposalAccess = {
  id: string;
  prslId: string;
  role: string;
  userId: string;
  permissions: string[];
  metaData?: Metadata;
};

export const NEW_PROPOSAL_ACCESS = {
  id: '',
  prsl_id: '',
  role: PROPOSAL_ROLE_PI,
  permissions: PROPOSAL_ACCESS_PERMISSIONS
};

export default ProposalAccess;
