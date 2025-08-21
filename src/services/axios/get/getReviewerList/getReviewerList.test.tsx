import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import * as CONSTANTS from '@utils/constants.ts';
import Reviewer from '@utils/types/reviewer.tsx';
import GetReviewerList, {
  GetMockReviewerList,
  getReviewersAlphabetical
} from './getReviewerList.tsx';
import MockReviewersBackendList from './mockReviewerList.tsx';

describe('Helper Functions', () => {
  test('getReviewersAlphabetical returns reviewers sorted alphabetically by displayName', () => {
    const result = getReviewersAlphabetical(MockReviewersBackendList);
    expect(result).toHaveLength(MockReviewersBackendList.length);
    expect(result[0].displayName).toBe('Aisha Rahman');
    expect(result[1].displayName).toBe('Amara Okafor');
    expect(result[2].displayName).toBe('Chloe Dubois');
  });

  test('GetMockReviewerList returns mock reviewers list', () => {
    const result = GetMockReviewerList();
    expect(result).toEqual(MockReviewersBackendList);
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

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetReviewerList(mockedAuthClient);
    expect(result).toEqual(MockReviewersBackendList);
  });

  test('returns sorted data from API when USE_LOCAL_DATA is false and multiple reviewers are returned', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockReviewersBackendList });
    const result = (await GetReviewerList(mockedAuthClient)) as Reviewer[];
    expect(result[0].displayName).toBe('Aisha Rahman');
    expect(result[1].displayName).toBe('Amara Okafor');
  });

  test('returns unsorted data when API returns only one reviewer', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    const singleReviewer = [{ displayName: 'Zara Khan' }];
    mockedAuthClient.get.mockResolvedValue({ data: singleReviewer });
    const result = await GetReviewerList(mockedAuthClient);
    expect(result).toEqual(singleReviewer);
  });

  test('returns error message on API failure with Error instance', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetReviewerList(mockedAuthClient);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetReviewerList(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetReviewerList(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
