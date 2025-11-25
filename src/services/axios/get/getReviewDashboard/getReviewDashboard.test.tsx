import { describe } from 'vitest';
import * as CONSTANTS from '@utils/constants.ts';
import getReviewDashboard, { getMockReviewDashboard } from './getReviewDashboard.tsx';
import { mockReviewDashboardBackend, mockReviewDashboardFrontend } from './mockReviewDashboard.tsx';

describe('Helper Functions', () => {
  test('getMockReviewDashboard returns mock data', () => {
    const result = getMockReviewDashboard();
    expect(result).to.deep.equal(mockReviewDashboardFrontend);
  });
});

describe('GetReviewDashboard Service', () => {
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
    const result = await getReviewDashboard(mockedAuthClient);
    expect(result).to.deep.equal(mockReviewDashboardFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: mockReviewDashboardBackend });
    const result = await getReviewDashboard(mockedAuthClient);
    expect(result).to.deep.equal(mockReviewDashboardFrontend);
  });

  test('returns unsorted data when API returns only one proposal review', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: [mockReviewDashboardBackend[0]] });
    const result = await getReviewDashboard(mockedAuthClient);
    expect(result).to.deep.equal([mockReviewDashboardFrontend[1]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await getReviewDashboard(mockedAuthClient);
    expect(result).to.deep.equal({
      error: 'Network Error'
    });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await getReviewDashboard(mockedAuthClient);
    expect(result).to.deep.equal({
      error: 'error.API_UNKNOWN_ERROR'
    });
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await getReviewDashboard(mockedAuthClient);
    expect(result).to.deep.equal({
      error: 'error.API_UNKNOWN_ERROR'
    });
  });
});
