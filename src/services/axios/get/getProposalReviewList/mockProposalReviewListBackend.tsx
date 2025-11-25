import { PANEL_DECISION_STATUS, REVIEW_TYPE } from '@utils/constants.ts';
import { ProposalReviewBackend } from '@utils/types/proposalReview.tsx';

export const MockProposalReviewListBackend: ProposalReviewBackend[] = [
  {
    panel_id: 'panel-12345',
    review_id: 'review-12345',
    cycle: 'cycle1',
    reviewer_id: 'reviewer-12347',
    prsl_id: 'prsl-t0001-20250716-00001',
    review_type: {
      kind: REVIEW_TYPE.SCIENCE,
      rank: 5,
      conflict: {
        has_conflict: false,
        reason: ''
      },
      excluded_from_decision: 'False'
    },
    comments: 'ok',
    src_net: '',
    submitted_on: '2025-07-16T08:35:24.245Z',
    submitted_by: 'user3',
    status: PANEL_DECISION_STATUS.REVIEWED
  },
  {
    panel_id: 'panel-12345',
    review_id: 'review-12346',
    cycle: 'cycle1',
    reviewer_id: 'reviewer-12345',
    prsl_id: 'prsl-t0001-20250716-00001',
    review_type: {
      kind: REVIEW_TYPE.SCIENCE,
      rank: 9,
      conflict: {
        has_conflict: true,
        reason: 'bias in proposal'
      },
      excluded_from_decision: 'True'
    },
    comments: 'recommend for approval',
    src_net: 'recommend as well',
    submitted_on: '2025-07-16T08:35:24.245Z',
    submitted_by: 'user1',
    status: PANEL_DECISION_STATUS.REVIEWED
  },
  {
    panel_id: 'panel-12345',
    review_id: 'review-12347',
    cycle: 'cycle1',
    reviewer_id: 'reviewer-12345',
    prsl_id: 'prsl-t0001-20250716-00001',
    review_type: {
      kind: REVIEW_TYPE.SCIENCE,
      rank: 8,
      conflict: {
        has_conflict: false,
        reason: ''
      },
      excluded_from_decision: 'False'
    },
    comments: 'recommended',
    src_net: 'great proposal',
    submitted_on: '2025-06-16T08:35:24.245Z',
    submitted_by: 'user1',
    status: PANEL_DECISION_STATUS.REVIEWED
  },
  {
    panel_id: 'panel-12345',
    review_id: 'review-12347',
    cycle: 'cycle1',
    reviewer_id: 'reviewer-12345',
    prsl_id: 'prsl-t0001-20250716-00001',
    review_type: {
      kind: REVIEW_TYPE.SCIENCE,
      rank: 8,
      conflict: {
        has_conflict: false,
        reason: ''
      },
      excluded_from_decision: 'False'
    },
    comments: 'recommended even more',
    src_net: 'great proposal',
    submitted_on: '2025-06-16T08:35:24.245Z',
    submitted_by: 'user1',
    status: PANEL_DECISION_STATUS.REVIEWED
  },
  {
    panel_id: 'panel-12345',
    review_id: 'review-12348',
    cycle: 'cycle1',
    reviewer_id: 'reviewer-12345',
    prsl_id: 'prsl-t0001-20250716-00001',
    review_type: {
      kind: REVIEW_TYPE.TECHNICAL,
      is_feasible: 'No'
    },
    comments: 'recommend for approval',
    src_net: 'recommend as well',
    submitted_on: '2025-06-16T08:35:24.245Z',
    submitted_by: 'user1',
    status: PANEL_DECISION_STATUS.REVIEWED
  }
];
