import { describe } from 'vitest';
import axios from 'axios';
import GetProposalReviewList, {
  GetMockProposalReviewList,
  getUniqueMostRecentReviews
} from './getProposalReviewList';
import { MockProposalReviewListFrontend } from './mockProposalReviewListFrontend';
import { MockProposalReviewListBackend } from './mockProposalReviewListBackend';
import { ProposalReview, ProposalReviewBackend } from '@/utils/types/proposalReview';
import * as CONSTANTS from '@/utils/constants';

const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('GetMockProposalReviewList returns mock data', () => {
    const result = GetMockProposalReviewList();
    expect(result).to.deep.equal(MockProposalReviewListFrontend);
  });

  test('GetMockProposalReviewList returns mock data correctly with 1 mock item', () => {
    const result = GetMockProposalReviewList([MockProposalReviewListBackend[0]]);
    expect(result).to.deep.equal([MockProposalReviewListFrontend[1]]);
  });

  test('sorts by latest updated and removes duplicates', () => {
    const result: ProposalReviewBackend[] = getUniqueMostRecentReviews(
      MockProposalReviewListBackend
    );
    expect(result).to.have.lengthOf(MockProposalReviewListBackend.length - 1);
    expect(result[0].metadata?.last_modified_on).to.equal('2025-09-16T08:35:24.245Z');
    expect(result[1].metadata?.last_modified_on).to.equal('2025-07-16T08:35:24.245Z');
  });
});

describe('GetProposalReviewList Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposalReviewList();
    expect(result).to.deep.equal(MockProposalReviewListFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockProposalReviewListBackend });
    const result = (await GetProposalReviewList()) as ProposalReview[];
    expect(result).to.deep.equal(MockProposalReviewListFrontend);
  });

  test('returns unsorted data when API returns only one proposal review', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: [MockProposalReviewListBackend[0]] });
    const result = await GetProposalReviewList();
    expect(result).to.deep.equal([MockProposalReviewListFrontend[1]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalReviewList();
    expect(result).to.deep.equal('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalReviewList();
    expect(result).to.deep.equal('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalReviewList();
    expect(result).to.deep.equal('error.API_UNKNOWN_ERROR');
  });
});
