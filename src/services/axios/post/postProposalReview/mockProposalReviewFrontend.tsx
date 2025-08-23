import { PANEL_DECISION_STATUS, REVIEW_TYPE, TECHNICAL_FEASIBILITY } from '@/utils/constants';
import { ProposalReview, TechnicalReview } from '@/utils/types/proposalReview';

export const MockProposalScienceReviewFrontend: ProposalReview = {
  metadata: {
    version: 1,
    created_by: 'user1',
    created_on: '2025-07-16T08:35:24.245Z',
    last_modified_by: 'user1',
    last_modified_on: '2025-07-16T08:35:24.245Z',
    pdm_version: '18.3.0'
  },
  panelId: 'panel-12345',
  id: 'review-12345',
  cycle: 'cycle1',
  reviewerId: 'reviewer-12345',
  prslId: 'prsl-t0001-20250716-00001',
  comments: 'recommend for approval',
  srcNet: 'recommend as well',
  submittedOn: '2025-07-16T08:35:24.245Z',
  submittedBy: 'user1',
  status: PANEL_DECISION_STATUS.DECIDED,
  reviewType: {
    kind: REVIEW_TYPE.SCIENCE,
    rank: 9,
    conflict: {
      hasConflict: false,
      reason: 'string'
    },
    excludedFromDecision: false
  }
};

export const MockProposalScienceReviewExcludedFrontend: ProposalReview = {
  metadata: {
    version: 1,
    created_by: 'user1',
    created_on: '2025-07-16T08:35:24.245Z',
    last_modified_by: 'user1',
    last_modified_on: '2025-07-16T08:35:24.245Z',
    pdm_version: '18.3.0'
  },
  panelId: 'panel-12345',
  id: 'review-12345',
  cycle: 'cycle1',
  reviewerId: 'reviewer-12345',
  prslId: 'prsl-t0001-20250716-00001',
  comments: 'recommend for approval',
  srcNet: 'recommend as well',
  submittedOn: '2025-07-16T08:35:24.245Z',
  submittedBy: 'user1',
  status: PANEL_DECISION_STATUS.DECIDED,
  reviewType: {
    kind: REVIEW_TYPE.SCIENCE,
    rank: 9,
    conflict: {
      hasConflict: false,
      reason: 'string'
    },
    excludedFromDecision: false
  }
};

export const MockProposalTechnicalReviewFrontend: ProposalReview = {
  metadata: {
    version: 1,
    created_by: 'user1',
    created_on: '2025-07-16T08:35:24.245Z',
    last_modified_by: 'user1',
    last_modified_on: '2025-07-16T08:35:24.245Z',
    pdm_version: '18.3.0'
  },
  panelId: 'panel-12345',
  id: 'review-12345',
  cycle: 'cycle1',
  reviewerId: 'reviewer-12345',
  prslId: 'prsl-t0001-20250716-00001',
  comments: 'recommend for approval',
  srcNet: 'recommend as well',
  submittedOn: '2025-07-16T08:35:24.245Z',
  submittedBy: 'user1',
  status: PANEL_DECISION_STATUS.DECIDED,
  reviewType: {
    kind: REVIEW_TYPE.TECHNICAL,
    isFeasible: TECHNICAL_FEASIBILITY.MAYBE
  } as TechnicalReview
};
