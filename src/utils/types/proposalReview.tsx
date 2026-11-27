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
