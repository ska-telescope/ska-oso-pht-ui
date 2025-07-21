// import axios from 'axios';
import axiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.tsx';
import { OSO_SERVICES_PROPOSAL_PATH, SKA_OSO_SERVICES_URL } from '@utils/constants.ts';

/*****************************************************************************************************************************/

const mapping = (response: {
  observatory_policy: {
    cycle_policies: { normal_max_hours: number };
    cycle_information: { proposal_close: string; cycle_id: string; proposal_open: string };
    cycle_description: string;
    telescope_capabilities: { Low: string; Mid: string };
    cycle_number: number;
  };
}) => {
  if (response.observatory_policy) {
    return (
      'cycle_number ' +
      response.observatory_policy.cycle_number +
      ' cycle_description ' +
      response.observatory_policy.cycle_description +
      ' cycle_id ' +
      response.observatory_policy.cycle_information.cycle_id +
      ' proposal_open ' +
      response.observatory_policy.cycle_information.proposal_open +
      ' proposal_close ' +
      response.observatory_policy.cycle_information.proposal_close +
      ' normal_max_hours ' +
      response.observatory_policy.cycle_policies.normal_max_hours +
      ' telescope_capabilities_low ' +
      response.observatory_policy.telescope_capabilities.Low +
      ' telescope_capabilities_mid ' +
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
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default GetCycleData;
