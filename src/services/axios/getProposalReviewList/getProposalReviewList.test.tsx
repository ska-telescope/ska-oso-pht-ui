import { describe } from 'vitest';
import { GetMockReviewerList } from './getProposalReviewList';

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
        prsl_id: 'prsl-t0001-20250707-00002',
        rank: 0,
        conflict: {
          has_conflict: false,
          reason: ''
        },
        comments: '',
        src_net: '',
        submitted_on: '',
        submitted_by: '',
        status: 'to do'
      }
    ]);
  });
});

/*
describe('GetProposalReviewList Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
});
*/
