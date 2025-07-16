import { Metadata } from './metadata';

export type ProposalReview = {
  metadata: Metadata;
  panelId: string;
  id: string;
  cycle: string;
  reviewerId: string;
  prslId: string;
  rank: number;
  conflict: {
    hasConflict: boolean;
    reason: string;
  };
  comments: string;
  srcNet: string;
  submittedOn: string;
  submittedBy: string;
  status: string;
};

export type ProposalReviewBackend = {
  metadata: Metadata;
  panel_id: string;
  review_id: string;
  cycle: string;
  reviewer_id: string;
  prsl_id: string;
  rank: number;
  conflict: {
    has_conflict: boolean;
    reason: string;
  };
  comments: string;
  src_net: string;
  submitted_on: string;
  submitted_by: string;
  status: string;
};
