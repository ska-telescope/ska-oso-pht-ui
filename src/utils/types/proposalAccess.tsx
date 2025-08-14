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
  role: '',
  permissions: []
};

export default ProposalAccess;
