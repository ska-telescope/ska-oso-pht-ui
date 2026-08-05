// import {
//     OSO_SERVICES_CALIBRATORS_PATH,
//   SKA_OSO_SERVICES_URL,
//   USE_LOCAL_DATA
// } from '@utils/constants.ts';
// import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.ts';
import { MockCalibratorBackendList } from './mockCalibratorListBackend.tsx';
import {
  CalibrationIntent,
  Calibrator,
  CalibratorBackend,
  SelectionStrategy
} from '@/utils/types/calibrationStrategy.tsx';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/


// at least duration should eventually come from the backend in future
const DEFAULT_CALIBRATION_INTENT: CalibrationIntent = "flux";
const DEFAULT_SELECTION_STRATEGY: SelectionStrategy = "highest_elevation";
const DEFAULT_DURATION_SECS = 600;


function calibratorMapping(data: CalibratorBackend): Calibrator {
  return {
    targetId: data.calibrator.target_id,
    name: data.calibrator.name,
    calibrationIntent: DEFAULT_CALIBRATION_INTENT,
    durationSeconds: DEFAULT_DURATION_SECS,
    selectionStrategy: DEFAULT_SELECTION_STRATEGY,
    notes: null,
    relativeToScan: data.when,
  };
}

/*****************************************************************************************************************************/

// This mocks fetching a list of observatory defined calibrators
export function GetMockCalibratorList(): Calibrator[] {
  const calibratorList: Calibrator[] = MockCalibratorBackendList.map(calibratorMapping);
  return calibratorList;
}

async function GetCalibratorList(): Promise<Calibrator[] | string> {
  // authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  // if (USE_LOCAL_DATA) {
  return GetMockCalibratorList(); // mocking observatory defined calibrators until new endpoint is ready
  // }

  /* try {
    const URL_PATH = `${OSO_SERVICES_CALIBRATORS_PATH}/`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !result.data || typeof result.data !== 'object') {
      return 'error.API_UNKNOWN_ERROR';
    }
    return result.data.map(calibratorMapping);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  } */
}

export default GetCalibratorList;
