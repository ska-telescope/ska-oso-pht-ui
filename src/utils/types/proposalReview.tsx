import { Metadata } from './metadata';

export type TechnicalReview = {
  kind: string;
  isFeasible: string;
};

export type ScienceReview = {
  kind: string;
  rank: number;
  conflict: {
    hasConflict: boolean;
    reason: string;
  };
  excludedFromDecision: boolean;
};

export type ProposalReview = {
  metadata?: Metadata;
  panelId: string;
  id: string;
  cycle: string;
  reviewerId: string;
  prslId: string;
  reviewType: ScienceReview | TechnicalReview;
  comments: string;
  srcNet: string;
  submittedOn: string | null;
  submittedBy: string | null;
  status: string;
};

export type ScienceReviewBackend = {
  kind: string;
  rank: number;
  conflict: {
    has_conflict: boolean;
    reason: string;
  };
  excluded_from_decision: string;
};

export type TechnicalReviewBackend = {
  kind: string;
  is_feasible: string;
};

export type ProposalReviewBackend = {
  metadata?: Metadata;
  panel_id: string;
  review_id: string;
  cycle: string;
  reviewer_id: string;
  prsl_id: string;
  comments: string;
  src_net: string;
  submitted_on: string | null;
  submitted_by: string | null;
  status: string;
  review_type: ScienceReviewBackend | TechnicalReviewBackend;
};
