import { beforeEach, describe, expect, test, vi } from 'vitest';
import ObservatoryData from '@utils/types/observatoryData.tsx';
import GetObservatoryData from '@/services/axios/get/getObservatoryData/getObservatoryData';
import { MockObservatoryDataBackend } from '@/services/axios/get/getObservatoryData/mockObservatoryDataBackend';
import { MockObservatoryDataFrontend } from '@/services/axios/get/getObservatoryData/mockObservatoryDataFrontend';

describe('GetObservatoryData Service', () => {
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

  test('returns mapped data from API', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: MockObservatoryDataBackend });
    const result = (await GetObservatoryData(
      mockedAuthClient,
      MockObservatoryDataBackend.observatory_policy.cycle_number
    )) as ObservatoryData;
    expect(result).to.deep.equal(MockObservatoryDataFrontend);
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetObservatoryData(
      mockedAuthClient,
      MockObservatoryDataBackend.observatory_policy.cycle_number
    );
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetObservatoryData(
      mockedAuthClient,
      MockObservatoryDataBackend.observatory_policy.cycle_number
    );
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API does not return data property', async () => {
    mockedAuthClient.get.mockResolvedValue(undefined);
    const result = await GetObservatoryData(
      mockedAuthClient,
      MockObservatoryDataBackend.observatory_policy.cycle_number
    );
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
