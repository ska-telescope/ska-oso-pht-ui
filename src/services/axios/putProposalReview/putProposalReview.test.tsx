// import axios from 'axios';
import { MockProposalReviewFrontend } from '../postProposalReview.tsx/mockProposalReviewFrontend';
import { putMockProposalReview } from './putProposalReview';

vi.mock('axios');
// const mockedAxios = (axios as unknown) as {
//   post: ReturnType<typeof vi.fn>;
// };

describe('Helper Functions', () => {
  test('putMockProposalReview returns mock review', () => {
    const result = putMockProposalReview();
    expect(result).to.deep.equal(MockProposalReviewFrontend);
  });
});
