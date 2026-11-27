import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  BAND_1_STR,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  SA_AA2
} from '@utils/constants.ts';
import type Target from '@/utils/types/target';
import {
  newObservation,
  newSvObservation,
  OBSERVING_MODE,
  type ObservationInput
} from '@/models/proposals/observations';
import { targetsToPdm } from '@/models/proposals/targets';
import { MockCalibratorBackendList } from '@/models/proposals/testing/mockCalibratorsPdm';
import { MockCalibratorFrontendList } from '@/models/proposals/testing/mockCalibrators';
import { UNKNOWN_API_ERROR } from './apiResult';
import {
  CALIBRATOR_NOT_SUPPORTED_FOR_SSO,
  CALIBRATOR_REQUIRES_INTEGRATION_TIME,
  findCalibrators
} from './calibrators';

// The error handling common to every call is tested with callApi (apiResult.test.tsx)

const { mockGetCalibrators } = vi.hoisted(() => ({ mockGetCalibrators: vi.fn() }));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: { proposals: { getCalibratorsOsoApiV17PhtCalibratorsPost: mockGetCalibrators } }
}));

const target = {
  id: 'target-1',
  name: 'M89',
  kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
  raStr: '12:35:39.8073',
  decStr: '12:33:22.831',
  velType: 1,
  redshift: '0.000914'
} as unknown as Target;

// LOW, for 1 h
const observation = newSvObservation(OBSERVING_MODE.CONTINUUM, 15);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('findCalibrators', () => {
  test('returns an SSO error without calling the API', async () => {
    const sso = { ...target, kind: REFERENCE_COORDINATE_TYPE_SSO.value } as Target;

    await expect(findCalibrators(observation, sso)).resolves.toEqual({
      error: CALIBRATOR_NOT_SUPPORTED_FOR_SSO
    });
    expect(mockGetCalibrators).not.toHaveBeenCalled();
  });

  test('returns an error without calling the API while the integration time is missing', async () => {
    const noTime = {
      ...observation,
      integrationTime: { value: null, unit: 'h' }
    } as ObservationInput;

    await expect(findCalibrators(noTime, target)).resolves.toEqual({
      error: CALIBRATOR_REQUIRES_INTEGRATION_TIME
    });
    expect(mockGetCalibrators).not.toHaveBeenCalled();
  });

  test('sends the telescope, scan duration, target and strategy, and maps the calibrators', async () => {
    mockGetCalibrators.mockResolvedValue({ data: MockCalibratorBackendList });

    await expect(findCalibrators(observation, target)).resolves.toEqual({
      data: MockCalibratorFrontendList
    });
    expect(mockGetCalibrators).toHaveBeenCalledExactlyOnceWith(
      'ska_low',
      3600000,
      targetsToPdm([target])[0],
      'highest_elevation'
    );
  });

  test('sends the scan duration of an integration time in minutes', async () => {
    mockGetCalibrators.mockResolvedValue({ data: MockCalibratorBackendList });

    await findCalibrators(
      {
        ...newObservation(BAND_1_STR, SA_AA2, OBSERVING_MODE.CONTINUUM, {}),
        integrationTime: { value: 30, unit: 'min' }
      } as ObservationInput,
      target
    );

    const [telescope, scanDurationMs] = mockGetCalibrators.mock.calls[0];
    expect(telescope).toBe('ska_mid');
    expect(scanDurationMs).toBe(1800000);
  });

  test('returns the standard error when the response is not a list', async () => {
    mockGetCalibrators.mockResolvedValue({ data: { not: 'an array' } });

    await expect(findCalibrators(observation, target)).resolves.toEqual({
      error: UNKNOWN_API_ERROR
    });
  });

  test('returns the error from a failed request', async () => {
    mockGetCalibrators.mockRejectedValue(new Error('Network Error'));

    await expect(findCalibrators(observation, target)).resolves.toEqual({
      error: 'Network Error'
    });
  });
});
