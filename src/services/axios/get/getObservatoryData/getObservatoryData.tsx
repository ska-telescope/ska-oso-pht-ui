// import axios from 'axios';
import {
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';
import { MockObservatoryDataBackend } from './mockObservatoryDataBackend';
import { ObservatoryData } from '@/utils/types/observatoryData';
import { osdMapping } from './getOSDCycles';

/*****************************************************************************************************************************/

export function GetMockData(mock = MockObservatoryDataBackend): ObservatoryData {
  return osdMapping([mock]);
}

export const toLowerCaseArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(item => typeof item === 'string').map(item => item.toLowerCase());
};

async function GetObservatoryData(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  cycleNumber: number
): Promise<string | ObservatoryData> {
  if (USE_LOCAL_DATA) {
    return GetMockData();
  }

  try {
    const URL_PATH = `/osd/`;
    const result = await authAxiosClient.get(
      `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PROPOSAL_PATH}${URL_PATH}${cycleNumber}`
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : osdMapping([result.data]);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetObservatoryData;
