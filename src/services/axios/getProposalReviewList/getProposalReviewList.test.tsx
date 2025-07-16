import { describe } from 'vitest';
import { GetMockReviewerList } from './getProposalReviewList';
import { MockProposalReviewListFrontend } from './mockProposalReviewListFrontend';

describe('Helper Functions', () => {
  test('GetMockReviewerList returns mock data', () => {
    const result = GetMockReviewerList();
    expect(result).to.deep.equal(MockProposalReviewListFrontend);
  });
});

/*
describe('GetProposalReviewList Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
});
*/
