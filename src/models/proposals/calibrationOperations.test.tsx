import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MockCalibratorBackendList } from '@services/axios/get/getCalibratorList/mockCalibratorListBackend.tsx';
import { AxiosAuthClient } from '@services/axios/axiosAuthClient/axiosAuthClient';
import * as helpers from '@/utils/helpers';
import { REFERENCE_COORDINATE_TYPE_SSO } from '@/utils/constants';
import { CalibrationStrategy } from '@/utils/types/calibrationStrategy';
import Target from '@/utils/types/target';
import { mockTarget } from '@/utils/autoLinking/mockTarget';
import { mockObservation } from '@/utils/autoLinking/mockObservation';
import { mockCalibration } from '@/utils/autoLinking/mockCalibration';
import {
  buildCalibrationStrategy,
  calibrationNotesFor,
  withCalibrationFor
} from './calibrationOperations';

const authClient = { post: vi.fn() };
const client = authClient as unknown as AxiosAuthClient;

const strategy = (observationIdRef: string, notes: string | null = null): CalibrationStrategy => ({
  observatoryDefined: true,
  id: `cal-${observationIdRef}`,
  observationIdRef,
  calibrators: null,
  notes
});

describe('buildCalibrationStrategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(helpers, 'generateCalibrationId').mockReturnValue('cal-0000000');
  });

  test('creates an observatory-defined strategy with the calibrators looked up', async () => {
    authClient.post.mockResolvedValue({ data: MockCalibratorBackendList });

    const calibration = await buildCalibrationStrategy(client, {
      observationId: 'obs-123',
      observation: mockObservation,
      target: mockTarget as Target
    });

    expect(calibration).toEqual(mockCalibration);
  });

  test('keeps the notes it is given', async () => {
    authClient.post.mockResolvedValue({ data: MockCalibratorBackendList });

    const calibration = await buildCalibrationStrategy(client, {
      observationId: 'obs-123',
      observation: mockObservation,
      target: mockTarget as Target,
      notes: 'Keep these'
    });

    expect(calibration.notes).toBe('Keep these');
  });

  test('looks up no calibrators for a solar system object', async () => {
    const calibration = await buildCalibrationStrategy(client, {
      observationId: 'obs-123',
      observation: mockObservation,
      target: { ...(mockTarget as Target), kind: REFERENCE_COORDINATE_TYPE_SSO.value }
    });

    expect(calibration.calibrators).toBeNull();
    expect(authClient.post).not.toHaveBeenCalled();
  });

  test('looks up no calibrators without an observation', async () => {
    const calibration = await buildCalibrationStrategy(client, {
      observationId: 'obs-123',
      target: mockTarget as Target
    });

    expect(calibration).toEqual({ ...mockCalibration, calibrators: null });
    expect(authClient.post).not.toHaveBeenCalled();
  });

  test('has no calibrators when the lookup fails', async () => {
    authClient.post.mockRejectedValue(new Error('unavailable'));

    const calibration = await buildCalibrationStrategy(client, {
      observationId: 'obs-123',
      observation: mockObservation,
      target: mockTarget as Target
    });

    expect(calibration.calibrators).toBeNull();
  });
});

describe('withCalibrationFor', () => {
  test("replaces only the strategy for the new strategy's observation", () => {
    const replacement = { ...strategy('obs-2'), id: 'cal-new' };

    expect(withCalibrationFor([strategy('obs-1'), strategy('obs-2')], replacement)).toEqual([
      strategy('obs-1'),
      replacement
    ]);
  });

  test('adds the strategy when its observation has none yet', () => {
    expect(withCalibrationFor([strategy('obs-1')], strategy('obs-2'))).toEqual([
      strategy('obs-1'),
      strategy('obs-2')
    ]);
  });
});

describe('calibrationNotesFor', () => {
  test("returns the observation's notes, or null when it has none", () => {
    const strategies = [strategy('obs-1', 'Notes for 1'), strategy('obs-2')];

    expect(calibrationNotesFor(strategies, 'obs-1')).toBe('Notes for 1');
    expect(calibrationNotesFor(strategies, 'obs-2')).toBeNull();
    expect(calibrationNotesFor(strategies, 'obs-3')).toBeNull();
  });
});
