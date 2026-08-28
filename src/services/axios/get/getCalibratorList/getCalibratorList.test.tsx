import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import GetCalibratorList, { GetMockCalibratorList } from './getCalibratorList';
import { MockCalibratorFrontendList } from './mockCalibratorListFrontend';
import { MockCalibratorBackendList } from './mockCalibratorListBackend';
import {
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_TYPE_INTEGRATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TELESCOPE_LOW_NUM
} from '@utils/constants.ts';
import { Calibrator } from '@/utils/types/calibrationStrategy';
import { Target } from '@/utils/types/target';
import Observation from '@/utils/types/observation';

describe('GetCalibratorList Service', () => {
  let mockedAuthClient: any;

  const mockTarget: Target = {
    id: 1,
    name: 'M89',
    kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
    raStr: '12:35:39.8073',
    decStr: '12:33:22.831',

    velType: 1,
    redshift: '0.000914'
  } as Target;

  const mockSSOTarget: Target = {
    id: 1,
    name: 'Venus',
    kind: REFERENCE_COORDINATE_TYPE_SSO.value
  };

  const mockObservation: Observation = {
    id: 'obs-1',
    telescope: TELESCOPE_LOW_NUM,
    supplied: {
      type: SUPPLIED_TYPE_INTEGRATION,
      value: 1,
      units: SUPPLIED_INTEGRATION_TIME_UNITS_H // TIME_HOURS
    }
  } as Observation;

  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      put: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { clear: vi.fn(), eject: vi.fn(), use: vi.fn() },
        response: { clear: vi.fn(), eject: vi.fn(), use: vi.fn() }
      }
    };
  });

  test('returns an SSO error string without calling the API', async () => {
    const result = await GetCalibratorList(mockedAuthClient, mockObservation, mockSSOTarget);

    expect(result).toBe('error.CALIBRATOR_NOT_SUPPORTED_FOR_SSO');
    expect(mockedAuthClient.post).not.toHaveBeenCalled();
  });

  test('returns mapped data from a successful API response', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: MockCalibratorBackendList });

    const result = (await GetCalibratorList(
      mockedAuthClient,
      mockObservation,
      mockTarget
    )) as Calibrator[];

    expect(result).to.deep.equal(MockCalibratorFrontendList);
  });

  test('sends the correct query params and body in the request', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: MockCalibratorBackendList });

    await GetCalibratorList(mockedAuthClient, mockObservation, mockTarget);

    const [calledUrl, calledBody] = mockedAuthClient.post.mock.calls[0];
    expect(calledUrl).toContain('telescope=ska_low');
    expect(calledUrl).toContain('scan_duration_ms=3600000');
    expect(calledUrl).toContain('strategy=highest_elevation');
    expect(calledBody).toEqual(mockTarget);
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));

    const result = await GetCalibratorList(mockedAuthClient, mockObservation, mockTarget);

    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.post.mockRejectedValue({ unexpected: 'object' });

    const result = await GetCalibratorList(mockedAuthClient, mockObservation, mockTarget);

    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: { not: 'an array' } });

    const result = await GetCalibratorList(mockedAuthClient, mockObservation, mockTarget);

    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
