import { PANEL_DECISION_STATUS, REVIEW_TYPE } from '@utils/constants.ts';
import { ProposalReview } from '@utils/types/proposalReview.tsx';

export const MockProposalReviewListFrontend: ProposalReview[] = [
  {
    panelId: 'panel-12345',
    id: 'review-12347',
    cycle: 'cycle1',
    reviewerId: 'reviewer-12345',
    prslId: 'prsl-t0001-20250716-00001',
    reviewType: {
      kind: REVIEW_TYPE.SCIENCE,
      rank: 8,
      conflict: {
        hasConflict: false,
        reason: ''
      },
      excludedFromDecision: false
    },
    comments: 'recommended even more',
    srcNet: 'great proposal',
    submittedOn: '2025-06-16T08:35:24.245Z',
    submittedBy: 'user1',
    status: PANEL_DECISION_STATUS.REVIEWED
  },
  {
    panelId: 'panel-12345',
    id: 'review-12345',
    cycle: 'cycle1',
    reviewerId: 'reviewer-12347',
    prslId: 'prsl-t0001-20250716-00001',
    reviewType: {
      kind: REVIEW_TYPE.SCIENCE,
      rank: 5,
      conflict: {
        hasConflict: false,
        reason: ''
      },
      excludedFromDecision: false
    },
    comments: 'ok',
    srcNet: '',
    submittedOn: '2025-07-16T08:35:24.245Z',
    submittedBy: 'user3',
    status: PANEL_DECISION_STATUS.REVIEWED
  },
  {
    panelId: 'panel-12345',
    id: 'review-12346',
    cycle: 'cycle1',
    reviewerId: 'reviewer-12345',
    prslId: 'prsl-t0001-20250716-00001',
    reviewType: {
      kind: REVIEW_TYPE.SCIENCE,
      rank: 9,
      conflict: {
        hasConflict: true,
        reason: 'bias in proposal'
      },
      excludedFromDecision: true
    },
    comments: 'recommend for approval',
    srcNet: 'recommend as well',
    submittedOn: '2025-07-16T08:35:24.245Z',
    submittedBy: 'user1',
    status: PANEL_DECISION_STATUS.REVIEWED
  },
  {
    panelId: 'panel-12345',
    id: 'review-12348',
    cycle: 'cycle1',
    reviewerId: 'reviewer-12345',
    prslId: 'prsl-t0001-20250716-00001',
    reviewType: {
      kind: REVIEW_TYPE.TECHNICAL,
      isFeasible: 'No'
    },
    comments: 'recommend for approval',
    srcNet: 'recommend as well',
    submittedOn: '2025-06-16T08:35:24.245Z',
    submittedBy: 'user1',
    status: PANEL_DECISION_STATUS.REVIEWED
  }
];
