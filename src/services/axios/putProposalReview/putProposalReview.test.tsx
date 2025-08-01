import { MockProposalReviewFrontend } from '../postProposalReview.tsx/mockProposalReviewFrontend';
import { MockProposalReviewBackend } from '../postProposalReview.tsx/mockProposalReviewBackend';
import PutProposalReview, { putMockProposalReview } from './putProposalReview';
import * as CONSTANTS from '@/utils/constants';

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
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      put: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { clear: vi.fn, eject: vi.fn(), use: vi.fn() },
        response: { clear: vi.fn, eject: vi.fn(), use: vi.fn() }
      }
    };
  });

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PutProposalReview(mockedAuthClient, MockProposalReviewFrontend);
    expect(result).to.deep.equal(MockProposalReviewFrontend);
  });

  test('returns data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue({ data: MockProposalReviewBackend });
    const result = await PutProposalReview(mockedAuthClient, MockProposalReviewFrontend);
    expect(result).to.deep.equal(MockProposalReviewFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutProposalReview(mockedAuthClient, MockProposalReviewFrontend);
    expect(result).to.deep.equal({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutProposalReview(mockedAuthClient, MockProposalReviewFrontend);
    expect(result).to.deep.equal({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(undefined);
    const result = await PutProposalReview(mockedAuthClient, MockProposalReviewFrontend);
    expect(result).to.deep.equal({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(null);
    const result = await PutProposalReview(mockedAuthClient, MockProposalReviewFrontend);
    expect(result).to.deep.equal({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
