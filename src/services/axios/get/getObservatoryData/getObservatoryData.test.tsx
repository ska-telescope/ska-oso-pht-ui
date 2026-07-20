import { beforeEach, describe, expect, test, vi } from 'vitest';
import ObservatoryData from '@utils/types/observatoryData.tsx';
import { MockObservatoryDataFrontend } from '@services/axios/get/getObservatoryData/mockObservatoryDataFrontend.tsx';
import GetObservatoryData from '@/services/axios/get/getObservatoryData/getObservatoryData';
import { MockObservatoryDataBackend } from '@/services/axios/get/getObservatoryData/mockObservatoryDataBackend';
import { osdMapping } from '@/services/axios/get/getObservatoryData/getOSDCycles';
import { SA_AA2 } from '@/utils/constants';
import { MockODTConfigurationBackend } from '@/services/axios/get/getObservatoryData/mockODTConfigurationBackend';

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
    mockedAuthClient.get
      .mockResolvedValueOnce({ data: MockObservatoryDataBackend })
      .mockResolvedValueOnce({ data: MockODTConfigurationBackend });
    const result = (await GetObservatoryData(
      mockedAuthClient,
      MockObservatoryDataBackend.observatory_policy.cycle_number
    )) as ObservatoryData;
    const stripFunctions = (obj: any) =>
      JSON.parse(
        JSON.stringify(obj, (_key, value) => (typeof value === 'function' ? undefined : value))
      );
    expect(stripFunctions(result)).to.deep.equal(stripFunctions(MockObservatoryDataFrontend));
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

  test('reads LOW capabilities from whichever array_assembly key the cycle actually has (e.g. AA2_SV), not a hardcoded AA2', () => {
    const aa2SvCycle = {
      ...MockObservatoryDataBackend,
      observatory_policy: {
        ...MockObservatoryDataBackend.observatory_policy,
        telescope_capabilities: {
          Mid: SA_AA2,
          Low: 'AA2_SV'
        }
      },
      capabilities: {
        ...MockObservatoryDataBackend.capabilities,
        low: {
          basic_capabilities: MockObservatoryDataBackend.capabilities.low.basic_capabilities,
          AA2_SV: {
            ...MockObservatoryDataBackend.capabilities.low.AA2,
            number_zoom_channels: 4000
          }
        }
      }
    };

    const result = osdMapping([aa2SvCycle], MockODTConfigurationBackend);
    const sArray = result.policies[0].capabilities.low?.subArrays.find(
      (s) => s.subArray === SA_AA2
    );
    expect(sArray?.numberZoomChannels).toBe(4000);
  });

  test('normalizes telescope_capabilities of "AA2_SV" to SA_AA2 in cyclePolicies.low/mid', () => {
    const aa2SvCycle = {
      ...MockObservatoryDataBackend,
      observatory_policy: {
        ...MockObservatoryDataBackend.observatory_policy,
        telescope_capabilities: {
          Mid: 'AA2_SV',
          Low: 'AA2_SV'
        }
      }
    };

    const result = osdMapping([aa2SvCycle], MockODTConfigurationBackend);
    expect(result.policies[0].cyclePolicies.low).toEqual([SA_AA2]);
    expect(result.policies[0].cyclePolicies.mid).toEqual([SA_AA2]);
  });
});
