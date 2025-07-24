import { Metadata } from './metadata';

export type ReviewType = {
  kind: string;
  rank: number;
  conflict: {
    hasConflict: boolean;
    reason: string;
  };
  excludedFromDecision: boolean;
};

export type ProposalReview = {
  metadata: Metadata;
  panelId: string;
  id: string;
  cycle: string;
  reviewerId: string;
  prslId: string;
  reviewType: ReviewType;
  comments: string;
  srcNet: string;
  submittedOn: string;
  submittedBy: string;
  status: string;
};

export type ReviewTypeBackend = {
  kind: string;
  rank: number;
  conflict: {
    has_conflict: boolean;
    reason: string;
  };
  excluded_from_decision: boolean;
};

export type ProposalReviewBackend = {
  metadata: Metadata;
  panel_id: string;
  review_id: string;
  cycle: string;
  reviewer_id: string;
  prsl_id: string;
  review_type: ReviewTypeBackend;
  comments: string;
  src_net: string;
  submitted_on: string;
  submitted_by: string;
  status: string;
};
