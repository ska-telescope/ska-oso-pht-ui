export type PanelProposal = {
  proposalId: string;
  panelId: string;
  assignedOn?: string; // TODO clarify if assignedOn should be set in the database
};

export type PanelProposalBackend = {
  prsl_id: string;
  assigned_on?: string; // TODO clarify if assignedOn should be set in the database
};
