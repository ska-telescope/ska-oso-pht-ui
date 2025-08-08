import { PANEL_DECISION_STATUS, REVIEW_TYPE, TECHNICAL_FEASIBILITY } from '@/utils/constants';
import { ProposalReviewBackend, TechnicalReviewBackend } from '@/utils/types/proposalReview';

export const MockProposalScienceReviewBackend: ProposalReviewBackend = {
  metadata: {
    version: 1,
    created_by: 'user1',
    created_on: '2025-07-16T08:35:24.245Z',
    last_modified_by: 'user1',
    last_modified_on: '2025-07-16T08:35:24.245Z',
    pdm_version: '18.3.0'
  },
  panel_id: 'panel-12345',
  review_id: 'review-12345',
  cycle: 'cycle1',
  reviewer_id: 'reviewer-12345',
  prsl_id: 'prsl-t0001-20250716-00001',
  comments: 'recommend for approval',
  src_net: 'recommend as well',
  submitted_on: '2025-07-16T08:35:24.245Z',
  submitted_by: 'user1',
  status: PANEL_DECISION_STATUS.DECIDED,
  review_type: {
    kind: REVIEW_TYPE.SCIENCE,
    rank: 9,
    conflict: {
      has_conflict: false,
      reason: 'string'
    },
    excluded_from_decision: 'False'
  }
};

export const MockProposalScienceReviewExcludedBackend: ProposalReviewBackend = {
  metadata: {
    version: 1,
    created_by: 'user1',
    created_on: '2025-07-16T08:35:24.245Z',
    last_modified_by: 'user1',
    last_modified_on: '2025-07-16T08:35:24.245Z',
    pdm_version: '18.3.0'
  },
  panel_id: 'panel-12345',
  review_id: 'review-12345',
  cycle: 'cycle1',
  reviewer_id: 'reviewer-12345',
  prsl_id: 'prsl-t0001-20250716-00001',
  comments: 'recommend for approval',
  src_net: 'recommend as well',
  submitted_on: '2025-07-16T08:35:24.245Z',
  submitted_by: 'user1',
  status: PANEL_DECISION_STATUS.DECIDED,
  review_type: {
    kind: REVIEW_TYPE.SCIENCE,
    rank: 9,
    conflict: {
      has_conflict: false,
      reason: 'string'
    },
    excluded_from_decision: 'False'
  }
};

export const MockProposalTechnicalReviewBackend: ProposalReviewBackend = {
  metadata: {
    version: 1,
    created_by: 'user1',
    created_on: '2025-07-16T08:35:24.245Z',
    last_modified_by: 'user1',
    last_modified_on: '2025-07-16T08:35:24.245Z',
    pdm_version: '18.3.0'
  },
  panel_id: 'panel-12345',
  review_id: 'review-12345',
  cycle: 'cycle1',
  reviewer_id: 'reviewer-12345',
  prsl_id: 'prsl-t0001-20250716-00001',
  comments: 'recommend for approval',
  src_net: 'recommend as well',
  submitted_on: '2025-07-16T08:35:24.245Z',
  submitted_by: 'user1',
  status: PANEL_DECISION_STATUS.DECIDED,
  review_type: {
    kind: REVIEW_TYPE.TECHNICAL,
    feasibility: {
      is_feasible: TECHNICAL_FEASIBILITY.MAYBE,
      comments: 'Technical improvements needed'
    }
  } as TechnicalReviewBackend
};
