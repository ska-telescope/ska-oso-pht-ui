export type PanelProposal = {
  proposalId: string;
  panelId: string;
  assignedOn?: string; // TODO clarify if assignedOn should be set in the database
};

export type PanelProposalBackend = {
  proposal_id: string;
  panel_id: string;
  assigned_on?: string; // TODO clarify if assignedOn should be set in the database
};
