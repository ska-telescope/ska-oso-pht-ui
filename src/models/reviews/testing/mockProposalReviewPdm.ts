import { PANEL_DECISION_STATUS } from '@/utils/constants';
import {
  FeasibilityStatus,
  ScienceReviewKindEnum,
  TechnicalReviewKindEnum
} from '@/generated/models';
import type { ReviewPDM } from '../reviews';

export const MockProposalScienceReviewPdm: ReviewPDM = {
  panel_id: 'panel-12345',
  review_id: 'review-12345',
  cycle: 'cycle1',
  reviewer_id: 'reviewer-12345',
  prsl_id: 'prsl-t0001-20250716-00001',
  comments: 'recommend for approval',
  src_net: 'recommend as well',
  submitted_on: '2025-07-16T08:35:24.245Z',
  submitted_by: 'user1',
  status: PANEL_DECISION_STATUS.REVIEWED,
  review_type: {
    kind: ScienceReviewKindEnum.ScienceReview,
    rank: 9,
    conflict: {
      has_conflict: false,
      reason: 'string'
    },
    excluded_from_decision: false
  }
};

export const MockProposalScienceReviewExcludedPdm: ReviewPDM = {
  panel_id: 'panel-12345',
  review_id: 'review-12345',
  cycle: 'cycle1',
  reviewer_id: 'reviewer-12345',
  prsl_id: 'prsl-t0001-20250716-00001',
  comments: 'recommend for approval',
  src_net: 'recommend as well',
  submitted_on: '2025-07-16T08:35:24.245Z',
  submitted_by: 'user1',
  status: PANEL_DECISION_STATUS.REVIEWED,
  review_type: {
    kind: ScienceReviewKindEnum.ScienceReview,
    rank: 9,
    conflict: {
      has_conflict: false,
      reason: 'string'
    },
    excluded_from_decision: false
  }
};

export const MockProposalTechnicalReviewPdm: ReviewPDM = {
  panel_id: 'panel-12345',
  review_id: 'review-12345',
  cycle: 'cycle1',
  reviewer_id: 'reviewer-12345',
  prsl_id: 'prsl-t0001-20250716-00001',
  comments: 'recommend for approval',
  src_net: 'recommend as well',
  submitted_on: '2025-07-16T08:35:24.245Z',
  submitted_by: 'user1',
  status: PANEL_DECISION_STATUS.REVIEWED,
  review_type: {
    kind: TechnicalReviewKindEnum.TechnicalReview,
    is_feasible: FeasibilityStatus.Maybe
  }
};
