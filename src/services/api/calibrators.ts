import { REFERENCE_COORDINATE_TYPE_SSO } from '@utils/constants.ts';
import type { Calibrator } from '@/utils/types/calibrationStrategy';
import type Target from '@utils/types/target.tsx';
import type { TelescopeType } from '@/generated/models';
import {
  INTEGRATION_TIME_UNIT_HOURS,
  type ObservationInput
} from '@/models/proposals/observations';
import { targetsToPdm } from '@/models/proposals/targets';
import {
  calibratorFromPdm,
  DEFAULT_CALIBRATOR_SELECTION
} from '@/models/proposals/calibrationStrategy';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

export const CALIBRATOR_NOT_SUPPORTED_FOR_SSO = 'error.CALIBRATOR_NOT_SUPPORTED_FOR_SSO';
export const CALIBRATOR_REQUIRES_INTEGRATION_TIME = 'error.CALIBRATOR_REQUIRES_INTEGRATION_TIME';

/**
 * Finds the calibrators for a target observed by an observation. There is no lookup for a solar
 * system object, or before the observation has an integration time (the scan duration).
 */
export const findCalibrators = async (
  observation: ObservationInput,
  target: Target
): Promise<ApiResult<Calibrator[]>> => {
  if (target.kind === REFERENCE_COORDINATE_TYPE_SSO.value) {
    return { error: CALIBRATOR_NOT_SUPPORTED_FOR_SSO };
  }

  const { value, unit } = observation.integrationTime;
  if (value === null || unit === null) {
    return { error: CALIBRATOR_REQUIRES_INTEGRATION_TIME };
  }
  const scanDurationMs = value * INTEGRATION_TIME_UNIT_HOURS[unit] * 3600 * 1000;

  // The endpoint takes one target at a time, which is enough for SV calls. An endpoint taking all
  // of a proposal's targets would save a request per target.
  const pdmTarget = targetsToPdm([target])[0];

  return callApi(
    () =>
      api.proposals.getCalibratorsOsoApiV17PhtCalibratorsPost(
        observation.telescope as TelescopeType,
        scanDurationMs,
        pdmTarget,
        DEFAULT_CALIBRATOR_SELECTION
      ),
    (data) => {
      // A response that isn't a list is malformed, so it fails rather than giving no calibrators
      if (!Array.isArray(data)) {
        throw new Error(UNKNOWN_API_ERROR);
      }
      return data.map(calibratorFromPdm);
    }
  );
};
