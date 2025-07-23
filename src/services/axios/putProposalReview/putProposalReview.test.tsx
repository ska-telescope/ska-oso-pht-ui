import axios from 'axios';
import { MockProposalReviewFrontend } from '../postProposalReview.tsx/mockProposalReviewFrontend';
import { MockProposalReviewBackend } from '../postProposalReview.tsx/mockProposalReviewBackend';
import PutProposalReview, { putMockProposalReview } from './putProposalReview';
import * as CONSTANTS from '@/utils/constants';

const mockedAxios = (axios as unknown) as {
  put: ReturnType<typeof vi.fn>;
};

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('putMockProposalReview returns mock review', () => {
    const result = putMockProposalReview();
    expect(result).to.deep.equal(MockProposalReviewFrontend);
  });
});

describe('PutProposalReview Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PutProposalReview(MockProposalReviewFrontend);
    expect(result).to.deep.equal(MockProposalReviewFrontend);
  });

  test('returns data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockResolvedValue({ data: MockProposalReviewBackend });
    const result = await PutProposalReview(MockProposalReviewFrontend);
    expect(result).to.deep.equal(MockProposalReviewFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutProposalReview(MockProposalReviewFrontend);
    expect(result).to.deep.equal({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutProposalReview(MockProposalReviewFrontend);
    expect(result).to.deep.equal({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockResolvedValue(undefined);
    const result = await PutProposalReview(MockProposalReviewFrontend);
    expect(result).to.deep.equal({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockResolvedValue(null);
    const result = await PutProposalReview(MockProposalReviewFrontend);
    expect(result).to.deep.equal({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
