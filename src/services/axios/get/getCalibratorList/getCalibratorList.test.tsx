import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { MockCalibratorFrontendList } from './mockCalibratorListFrontend';
import { MockCalibratorBackendList } from './mockCalibratorListBackend';
import { BAND_1_STR, SA_AA2 } from '@utils/constants.ts';
import { Calibrator } from '@/utils/types/calibrationStrategy';
import {
  newTarget,
  RADIAL_MOTION_TYPE,
  REFERENCE_COORDINATE_KIND,
  type TargetInput,
  targetsToPdm
} from '@/models/proposals/targets';
import {
  newObservation,
  newSvObservation,
  OBSERVING_MODE,
  type ObservationInput
} from '@/models/proposals/observations';
import GetCalibratorList from '@services/axios/get/getCalibratorList/getCalibratorList.tsx';

describe('GetCalibratorList Service', () => {
  let mockedAuthClient: any;

  const mockTarget: TargetInput = {
    ...newTarget('target-1', REFERENCE_COORDINATE_KIND.ICRS),
    name: 'M89',
    referenceCoordinate: {
      kind: REFERENCE_COORDINATE_KIND.ICRS,
      raStr: '12:35:39.8073',
      decStr: '12:33:22.831'
    },
    radialMotion: { type: RADIAL_MOTION_TYPE.REDSHIFT, redshift: 0.000914 }
  };

  const mockSSOTarget: TargetInput = {
    ...newTarget('target-1', REFERENCE_COORDINATE_KIND.SPECIAL),
    name: 'Venus',
    referenceCoordinate: { kind: REFERENCE_COORDINATE_KIND.SPECIAL, name: 'Venus' }
  };

  // LOW, for 1 h
  const mockObservation = newSvObservation(OBSERVING_MODE.CONTINUUM, 15);

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

  test('returns an error without calling the API while the integration time is missing', async () => {
    const result = await GetCalibratorList(
      mockedAuthClient,
      { ...mockObservation, integrationTime: { value: null, unit: 'h' } } as ObservationInput,
      mockTarget
    );

    expect(result).toBe('error.CALIBRATOR_REQUIRES_INTEGRATION_TIME');
    expect(mockedAuthClient.post).not.toHaveBeenCalled();
  });

  test('sends the scan duration of an integration time in minutes', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: MockCalibratorBackendList });

    await GetCalibratorList(
      mockedAuthClient,
      {
        ...newObservation(BAND_1_STR, SA_AA2, OBSERVING_MODE.CONTINUUM, {}),
        integrationTime: { value: 30, unit: 'min' }
      } as ObservationInput,
      mockTarget
    );

    const [calledUrl] = mockedAuthClient.post.mock.calls[0];
    expect(calledUrl).toContain('telescope=ska_mid');
    expect(calledUrl).toContain('scan_duration_ms=1800000');
  });

  test('sends the correct query params and body in the request', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: MockCalibratorBackendList });

    await GetCalibratorList(mockedAuthClient, mockObservation, mockTarget);

    const [calledUrl, calledBody] = mockedAuthClient.post.mock.calls[0];
    expect(calledUrl).toContain('telescope=ska_low');
    expect(calledUrl).toContain('scan_duration_ms=3600000');
    expect(calledUrl).toContain('strategy=highest_elevation');
    expect(calledBody).toEqual(targetsToPdm([mockTarget])[0]);
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
