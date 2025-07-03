import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import GetReviewerList, { GetMockReviewerList, getReviewersAlphabetical } from './getReviewerList';
import MockReviewersBackendList from './mockReviewerList';
import * as CONSTANTS from '@/utils/constants';
import Reviewer from '@/utils/types/reviewer';

const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

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
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetReviewerList();
    expect(result).toEqual(MockReviewersBackendList);
  });

  test('returns sorted data from API when USE_LOCAL_DATA is false and multiple reviewers are returned', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockReviewersBackendList });
    const result = (await GetReviewerList()) as Reviewer[];
    expect(result[0].displayName).toBe('Aisha Rahman');
    expect(result[1].displayName).toBe('Amara Okafor');
  });

  test('returns unsorted data when API returns only one reviewer', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    const singleReviewer = [{ displayName: 'Zara Khan' }];
    mockedAxios.get.mockResolvedValue({ data: singleReviewer });
    const result = await GetReviewerList();
    expect(result).toEqual(singleReviewer);
  });

  test('returns error message on API failure with Error instance', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetReviewerList();
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetReviewerList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetReviewerList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
