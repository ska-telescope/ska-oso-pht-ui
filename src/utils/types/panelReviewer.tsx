export type PanelReviewer = {
  reviewerId: string;
  panelId: string;
  assignedOn?: string;
  status: string;
};

export type PanelReviewerBackend = {
  reviewer_id: string;
  assigned_on?: string;
  status: string;
};
