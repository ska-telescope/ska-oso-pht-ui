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
    rank: 8,
    conflict: {
      hasConflict: false,
      reason: ''
    },
    comments: 'recommended even more',
    srcNet: 'great proposal',
    submittedOn: '2025-06-16T08:35:24.245Z',
    submittedBy: 'user1',
    status: 'Decided'
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
    rank: 5,
    conflict: {
      hasConflict: false,
      reason: ''
    },
    comments: 'ok',
    srcNet: '',
    submittedOn: '2025-07-16T08:35:24.245Z',
    submittedBy: 'user3',
    status: 'Decided'
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
    rank: 9,
    conflict: {
      hasConflict: true,
      reason: 'bias in proposal'
    },
    comments: 'recommend for approval',
    srcNet: 'recommend as well',
    submittedOn: '2025-07-16T08:35:24.245Z',
    submittedBy: 'user1',
    status: 'Decided'
  }
];
