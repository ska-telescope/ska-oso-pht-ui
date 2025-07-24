import { PANEL_DECISION_STATUS } from '@/utils/constants';
import { ProposalReview } from '@/utils/types/proposalReview';

export const MockProposalReviewFrontend: ProposalReview = {
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
    kind: 'Science Review',
    rank: 9,
    conflict: {
      hasConflict: false,
      reason: 'string'
    },
    excludedFromDecision: false
  }
};
