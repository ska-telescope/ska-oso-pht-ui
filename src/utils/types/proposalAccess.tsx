import { PROPOSAL_ACCESS_SUBMIT, PROPOSAL_ACCESS_UPDATE, PROPOSAL_ACCESS_VIEW } from '../constants';

export type ProposalAccessBackend = {
  prsl_id: string;
  role: string;
  permissions: string[];
};

export type ProposalAccess = {
  prslId: string;
  role: string;
  permissions: string[];
};

export const NEW_PROPOSAL_ACCESS = {
  prsl_id: '',
  role: 'Principle Investigator',
  permissions: [PROPOSAL_ACCESS_VIEW, PROPOSAL_ACCESS_UPDATE, PROPOSAL_ACCESS_SUBMIT]
};

export default ProposalAccess;
