// import axios from 'axios';
import {
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';
import { MockObservatoryDataBackend } from './mockObservatoryDataBackend';
import { MockODTConfigurationBackend } from './mockODTConfigurationBackend';
import { ObservatoryData, ObservatoryDataBackend } from '@/utils/types/observatoryData';
import { ODTConfigurationBackend } from '@utils/types/odtConfiguration.tsx';
import { osdMapping } from './getOSDCycles';

/*****************************************************************************************************************************/

export function GetMockData(
  mock = MockObservatoryDataBackend,
  odtConfig = MockODTConfigurationBackend
): ObservatoryData {
  return osdMapping([mock], odtConfig);
}

async function GetObservatoryData(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  cycleNumber: number
): Promise<string | ObservatoryData> {
  if (USE_LOCAL_DATA) {
    return GetMockData();
  }

  try {
    const [cycleResult, odtResult] = await Promise.all([
      authAxiosClient.get(
        `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PROPOSAL_PATH}/osd/${cycleNumber}`
      ),
      authAxiosClient.get(`${SKA_OSO_SERVICES_URL}/odt/configuration`)
    ]);

    const cycleData = cycleResult?.data as ObservatoryDataBackend | undefined;
    const odtConfig = odtResult?.data as ODTConfigurationBackend | undefined;
    if (!cycleData || !odtConfig) return 'error.API_UNKNOWN_ERROR';
    
    return osdMapping([cycleData], odtConfig);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetObservatoryData;
