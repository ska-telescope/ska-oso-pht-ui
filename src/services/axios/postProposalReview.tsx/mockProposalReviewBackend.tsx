import { ProposalReviewBackend } from '@/utils/types/proposalReview';

export const MockProposalReviewBackend: ProposalReviewBackend = {
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
  rank: 9,
  conflict: {
    has_conflict: true,
    reason: 'bias in proposal'
  },
  comments: 'recommend for approval',
  src_net: 'recommend as well',
  submitted_on: '2025-07-16T08:35:24.245Z',
  submitted_by: 'user1',
  status: 'Decided'
};
