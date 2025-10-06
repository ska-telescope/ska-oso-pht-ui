import { describe } from 'vitest';
import { ProposalReview, ProposalReviewBackend } from '@utils/types/proposalReview.tsx';
import * as CONSTANTS from '@utils/constants.ts';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import GetProposalReviewList, { GetMockProposalReviewList } from './getProposalReviewList.tsx';
import { MockProposalReviewListFrontend } from './mockProposalReviewListFrontend.tsx';
import { MockProposalReviewListBackend } from './mockProposalReviewListBackend.tsx';

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
    const result: ProposalReviewBackend[] = getUniqueMostRecentItems(
      MockProposalReviewListBackend,
      'review_id'
    );
    expect(result).to.have.lengthOf(MockProposalReviewListBackend.length - 1);
    expect(result[0].metadata?.last_modified_on).to.equal('2025-09-16T08:35:24.245Z');
    expect(result[1].metadata?.last_modified_on).to.equal('2025-07-16T08:35:24.245Z');
  });
});

describe('GetProposalReviewList Service', () => {
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

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposalReviewList(mockedAuthClient);
    expect(result).to.deep.equal(MockProposalReviewListFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalReviewListBackend });
    const result = (await GetProposalReviewList(mockedAuthClient)) as ProposalReview[];
    expect(result).to.deep.equal(MockProposalReviewListFrontend);
  });

  test('returns unsorted data when API returns only one proposal review', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: [MockProposalReviewListBackend[0]] });
    const result = await GetProposalReviewList(mockedAuthClient);
    expect(result).to.deep.equal([MockProposalReviewListFrontend[1]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalReviewList(mockedAuthClient);
    expect(result).to.deep.equal('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalReviewList(mockedAuthClient);
    expect(result).to.deep.equal('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalReviewList(mockedAuthClient);
    expect(result).to.deep.equal('error.API_UNKNOWN_ERROR');
  });
});
