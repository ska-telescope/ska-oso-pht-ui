import { Metadata } from './metadata';
import {
  PROPOSAL_ACCESS_SUBMIT,
  PROPOSAL_ACCESS_UPDATE,
  PROPOSAL_ACCESS_VIEW
} from '@/utils/aaa/aaaUtils';

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
  role: 'Principal Investigator',
  permissions: [PROPOSAL_ACCESS_VIEW, PROPOSAL_ACCESS_UPDATE, PROPOSAL_ACCESS_SUBMIT]
};

export default ProposalAccess;
