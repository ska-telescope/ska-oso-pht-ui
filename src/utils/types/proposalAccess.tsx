import { Metadata } from './metadata';

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
  userId: '',
  role: '',
  permissions: []
};

export default ProposalAccess;
