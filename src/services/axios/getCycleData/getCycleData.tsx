// import axios from 'axios';
import CycleData from '../../../utils/types/cycleData';
import MockCycleData from './mockCycleData';
import { OSO_SERVICES_PROPOSAL_PATH, SKA_OSO_SERVICES_URL, USE_LOCAL_DATA } from '@utils/constants.ts';
import axiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';

/*****************************************************************************************************************************/
// export function GetMockCycleData(): CycleData[] {
//   return MockCycleData;
// }

const MOCK_RESULTS = [
  {
    observatoryPolicy: {
      cycleNumber: 1,
      cycleDescription: 'Science Verification',
      cycleInformation: {cycleId : 'SKAO_2027_1', proposalOpen: '20260327T12:00:00.000Z', proposalClose: '20260512T15:00:00.000z'},
      cyclePolicies: {normalMaxHours : 100},
      telescopeCapabilities: {mid : 'AA2', low : 'AA2'},
    }
  },
];

const mapping = (
  response:
    | {
    observatoryPolicy: {
      cyclePolicies: { normalMaxHours: number };
      cycleInformation: { proposalClose: string; cycleId: string; proposalOpen: string };
      cycleDescription: string;
      telescopeCapabilities: { low: string; mid: string };
      cycleNumber: number
    }
  }
) => {
  if (response.observatoryPolicy) {
    return (
      response.observatoryPolicy.cycleNumber +
      ' ' +
      response.observatoryPolicy.cycleDescription +
      ' ' +
      response.observatoryPolicy.cycleInformation +
      ' ' +
      response.observatoryPolicy.cyclePolicies +
      ' ' +
      response.observatoryPolicy.telescopeCapabilities
    );
  } else {
    return { error: 'cycle.error' };
  }
};

async function GetCycleData(cycleNumber: number): Promise<string | { error: string }> {
  try {
    const URL_PATH = `/osd/`;
    const result = await axiosAuthClient.get(
      `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PROPOSAL_PATH}${URL_PATH}${cycleNumber}`
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default GetCycleData;
