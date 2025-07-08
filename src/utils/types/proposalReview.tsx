type ProposalReview = {
  metadata: {
    version: number;
    created_by: string;
    created_on: string;
    last_modified_by: string;
    last_modified_on: string;
    pdm_version: string;
  };
  panel_id: string;
  review_id: string;
  cycle: string;
  reviewer_id: string;
  prsl_id: string;
  rank: number;
  conflict: {
    has_conflict: false;
    reason: string;
  };
  comments: string;
  src_net: string;
  submitted_on: string;
  submitted_by: string;
  status: string;
};

export default ProposalReview;
