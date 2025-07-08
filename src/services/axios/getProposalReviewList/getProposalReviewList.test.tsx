import { describe, vi, beforeEach } from 'vitest';
import axios from 'axios';
import GetProposalReviewList, { GetMockReviewerList } from './getProposalReviewList';
import * as CONSTANTS from '@/utils/constants';

const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('GetMockReviewerList returns mock data', () => {
    const result = GetMockReviewerList();
    expect(result).to.deep.equal([
      {
        metadata: {
          version: 1,
          created_by: 'created_by',
          created_on: '2025-07-07T18:13:25.470Z',
          last_modified_by: 'last_modified_by',
          last_modified_on: '2025-07-07T18:13:25.470Z',
          pdm_version: '18.3.0'
        },
        panel_id: 'panel_id',
        review_id: 'review_id',
        cycle: 'cycle',
        reviewer_id: 'reviewer_id',
        prsl_id: 'prsl_id',
        rank: 0,
        conflict: {
          has_conflict: false,
          reason: ''
        },
        comments: '',
        src_net: '',
        submitted_on: '',
        submitted_by: '',
        status: ''
      }
    ]);
  });
});

describe('GetProposalReviewList Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
});
