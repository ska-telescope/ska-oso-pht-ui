import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { Reviewer } from '@utils/types/reviewer.tsx';
import GetReviewerList, { getReviewersAlphabetical } from './getReviewerList.tsx';
import { MockReviewersList, MockReviewersBackendList } from './mockReviewerList.tsx';

describe('Helper Functions', () => {
  test('getReviewersAlphabetical returns reviewers sorted alphabetically by displayName', () => {
    const result = getReviewersAlphabetical(MockReviewersList);
    expect(result).toHaveLength(MockReviewersList.length);
    expect(result[0].displayName).toBe('Aisha Rahman');
    expect(result[1].displayName).toBe('Amara Okafor');
    expect(result[2].displayName).toBe('Chloe Dubois');
  });
});

describe('GetReviewerList Service', () => {
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

  test('returns sorted data from API when multiple reviewers are returned', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: MockReviewersBackendList });
    const result = (await GetReviewerList(mockedAuthClient)) as Reviewer[];
    expect(result).toEqual(MockReviewersList);
    // expect(result[0].displayName).toBe('Aisha Rahman');
    // expect(result[1].displayName).toBe('Amara Okafor');
  });

  test('returns error message on API failure with Error instance', async () => {
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetReviewerList(mockedAuthClient);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.get.mockRejectedValue({ data: 'error.API_UNKNOWN_ERROR' });
    const result = await GetReviewerList(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
