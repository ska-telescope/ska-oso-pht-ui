export type PanelReviewer = {
  reviewerId: string;
  panelId: string;
  reviewType: string;
  assignedOn?: string; // TODO clarify if assignedOn should be set in the database
  status: string;
};

export type PanelReviewerBackend = {
  reviewer_id: string;
  assigned_on?: string; // TODO clarify if assignedOn should be set in the database
  status: string;
};
