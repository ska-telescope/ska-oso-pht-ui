import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import GetReviewerList, { GetMockReviewerList, getReviewersAlphabetical } from './getReviewerList';
import MockReviewersBackendList from './mockReviewerList';
import * as CONSTANTS from '@/utils/constants';
import Reviewer from '@/utils/types/reviewer';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('GetReviewerList', () => {
  test('getReviewersAlphabetical returns reviewers sorted alphabetically by displayName', () => {
    const result = getReviewersAlphabetical(MockReviewersBackendList);
    expect(result).to.have.lengthOf(MockReviewersBackendList.length);
    expect(result[0].displayName).to.equal('Aisha Rahman');
    expect(result[1].displayName).to.equal('Amara Okafor');
    expect(result[2].displayName).to.equal('Chloe Dubois');
  });

  test('GetMockReviewerList returns mock reviewers list', () => {
    const result = GetMockReviewerList();
    expect(result).to.have.lengthOf(MockReviewersBackendList.length);
    expect(result).to.equal(MockReviewersBackendList);
  });
});

describe('GetReviewerList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetReviewerList();
    expect(result).toEqual(MockReviewersBackendList);
  });

  test('returns sorted data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    const mockData: Reviewer[] = [
      {
        id: 'c8f8f18a-3c70-4c39-8ed9-2d8d180d99a5',
        jobTitle: 'Dr.',
        givenName: 'Anna',
        surname: 'Lucas',
        displayName: 'Anna Lucas',
        mail: 'anna.lucas@example.com',
        officeLocation: 'Annex',
        subExpertise: 'HI Surveys'
      },
      {
        id: 'c8f8f18a-3c70-4c39-8ed9-2d8d180d99a6',
        jobTitle: 'Prof.',
        givenName: 'Bernadette',
        surname: 'Lewis',
        displayName: 'Bernadette Lewis',
        mail: 'bernardette.lewis@example.com',
        officeLocation: 'Lab 1',
        subExpertise: 'Pulsar Timing'
      }
    ];
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = (await GetReviewerList()) as Reviewer[];
    expect(result[0].displayName).toBe('Anna Lucas');
    expect(result[1].displayName).toBe('Bernadette Lewis');
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    const result = await GetReviewerList();
    expect(result).toBe('Network Error');
  });
});
