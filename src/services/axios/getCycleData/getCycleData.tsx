// import axios from 'axios';
import CycleData from '../../../utils/types/cycleData';
import MockCycleData from './mockCycleData';
import axiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';
import { OSO_SERVICES_PROPOSAL_PATH, SKA_OSO_SERVICES_URL } from '@utils/constants.ts';

/*****************************************************************************************************************************/

// TODO : PLACEHOLDER FOR GET-CYCLE-DATA ENDPOINT

export function GetMockCycleData(): CycleData[] {
  return MockCycleData;
}


const mapping = (
  response:
    | {
      observatory_policy: {
      cycle_policies: { normal_max_hours: number };
      cycle_information: { proposal_close: string; cycle_id: string; proposal_open: string };
      cycle_description: string;
      telescope_capabilities: { Low: string; Mid: string };
      cycle_number: number
    }
  }
) => {
  console.log('inside if.. ', response);
  console.log('check response observatory policy data', response.observatory_policy);

  if (response.observatory_policy) {
    return (
      response.observatory_policy.cycle_number +
      ' ' +
      response.observatory_policy.cycle_description +
      ' ' +
      response.observatory_policy.cycle_information.cycle_id +
      ' ' +
      response.observatory_policy.cycle_information.proposal_open +
      ' ' +
      response.observatory_policy.cycle_information.proposal_close +
      ' ' +
      response.observatory_policy.cycle_policies.normal_max_hours +
      ' ' +
      response.observatory_policy.telescope_capabilities.Low +
      ' ' +
      response.observatory_policy.telescope_capabilities.Mid
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
    console.log('result of request', result);
    console.log('sending to mapping', result.data);

    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default GetCycleData;
