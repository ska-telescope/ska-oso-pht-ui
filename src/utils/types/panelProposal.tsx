export type PanelProposal = {
  proposalId: string;
  panelId: string;
  assignedOn?: string; // TODO clarify if assignedOn should be set in the database
};
