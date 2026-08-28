import {
  OSO_SERVICES_CALIBRATORS_PATH,
  REFERENCE_COORDINATE_TYPE_SSO,
  SKA_OSO_SERVICES_URL,
  SUPPLIED_TYPE_INTEGRATION,
  TELESCOPE_LOW_BACKEND_MAPPING,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_BACKEND_MAPPING,
  TIME_MS
} from '@utils/constants.ts';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.ts';
import { MockCalibratorBackendList } from './mockCalibratorListBackend.tsx';
import {
  CalibrationIntent,
  Calibrator,
  CalibratorBackend,
  SelectionStrategy
} from '@/utils/types/calibrationStrategy.tsx';
import Target from '@utils/types/target.tsx';
import Observation from '@utils/types/observation.tsx';
import { timeConversion } from '@utils/helpers.ts';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

// at least duration should eventually come from the backend in future
const DEFAULT_CALIBRATION_INTENT: CalibrationIntent = 'flux';
const DEFAULT_SELECTION_STRATEGY: SelectionStrategy = 'highest_elevation';
const DEFAULT_DURATION_SECS = 600;

function calibratorMapping(data: CalibratorBackend): Calibrator {
  return {
    targetId: data.calibrator.target_id,
    name: data.calibrator.name,
    calibrationIntent: DEFAULT_CALIBRATION_INTENT,
    durationSeconds: DEFAULT_DURATION_SECS,
    selectionStrategy: DEFAULT_SELECTION_STRATEGY,
    notes: null,
    relativeToScan: data.when
  };
}

/*****************************************************************************************************************************/

// This mocks fetching a list of observatory defined calibrators
export function GetMockCalibratorList(): Calibrator[] {
  const calibratorList: Calibrator[] = MockCalibratorBackendList.map(calibratorMapping);
  return calibratorList;
}

async function GetCalibratorList(
  authAxiosClient: AxiosAuthClient,
  observation: Observation,
  target: Target
): Promise<Calibrator[] | string> {
  if (target.kind === REFERENCE_COORDINATE_TYPE_SSO.value) {
    return 'error.CALIBRATOR_NOT_SUPPORTED_FOR_SSO';
  }

  if (observation.supplied.type !== SUPPLIED_TYPE_INTEGRATION) {
    return 'error.CALIBRATOR_REQUIRES_INTEGRATION_TIME';
  }

  const telescopeBackendString =
    observation.telescope === TELESCOPE_LOW_NUM
      ? TELESCOPE_LOW_BACKEND_MAPPING
      : TELESCOPE_MID_BACKEND_MAPPING;

  const scanDurationMs = timeConversion(
    observation.supplied.value,
    observation.supplied.units,
    TIME_MS
  );

  try {
    const params = new URLSearchParams({
      telescope: telescopeBackendString,
      scan_duration_ms: String(scanDurationMs),
      strategy: DEFAULT_SELECTION_STRATEGY
    });
    const URL_PATH = `${OSO_SERVICES_CALIBRATORS_PATH}?${params.toString()}`;

    const result = await authAxiosClient.post(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, target);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }

    return result.data.map(calibratorMapping);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetCalibratorList;
