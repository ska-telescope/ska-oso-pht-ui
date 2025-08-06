import { PANEL_DECISION_STATUS, REVIEW_TYPE } from '@/utils/constants';
import { ProposalReview } from '@/utils/types/proposalReview';

export const MockProposalReviewListFrontend: ProposalReview[] = [
  {
    metadata: {
      version: 2,
      created_by: 'user2',
      created_on: '2025-06-16T08:35:24.245Z',
      last_modified_by: 'user2',
      last_modified_on: '2025-09-16T08:35:24.245Z',
      pdm_version: '18.3.0'
    },
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
    status: PANEL_DECISION_STATUS.DECIDED
  },
  {
    metadata: {
      version: 1,
      created_by: 'user3',
      created_on: '2025-07-16T08:35:24.245Z',
      last_modified_by: 'user3',
      last_modified_on: '2025-07-16T08:35:24.245Z',
      pdm_version: '18.3.0'
    },
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
    status: PANEL_DECISION_STATUS.DECIDED
  },
  {
    metadata: {
      version: 1,
      created_by: 'user1',
      created_on: '2025-07-16T08:35:24.245Z',
      last_modified_by: 'user1',
      last_modified_on: '2025-07-16T08:35:24.245Z',
      pdm_version: '18.3.0'
    },
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
    status: PANEL_DECISION_STATUS.DECIDED
  },
  {
    metadata: {
      version: 1,
      created_by: 'user1',
      created_on: '2025-06-16T08:35:24.245Z',
      last_modified_by: 'user1',
      last_modified_on: '2024-09-16T08:35:24.245Z',
      pdm_version: '18.3.0'
    },
    panelId: 'panel-12345',
    id: 'review-12348',
    cycle: 'cycle1',
    reviewerId: 'reviewer-12345',
    prslId: 'prsl-t0001-20250716-00001',
    reviewType: {
      kind: REVIEW_TYPE.TECHNICAL,
      feasibility: {
        isFeasible: 'No',
        comments: 'bias in proposal'
      }
    },
    comments: 'recommend for approval',
    srcNet: 'recommend as well',
    submittedOn: '2025-06-16T08:35:24.245Z',
    submittedBy: 'user1',
    status: PANEL_DECISION_STATUS.DECIDED
  }
];
