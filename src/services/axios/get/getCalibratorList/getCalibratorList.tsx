// import {
//     OSO_SERVICES_CALIBRATORS_PATH,
//   SKA_OSO_SERVICES_URL,
//   USE_LOCAL_DATA
// } from '@utils/constants.ts';
// import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.ts';
import { MockCalibratorBackendList } from './mockCalibratorListBackend.tsx';
import { Calibrator, CalibratorBackend } from '@/utils/types/calibrationStrategy.tsx';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function calibratorMapping(data: CalibratorBackend): Calibrator {
  return {
    calibrationIntent: data.calibration_intent,
    name: data.name,
    durationMin: data.duration_min,
    choice: data.choice,
    notes: data.notes
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
