import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import Observation from '@/utils/types/observation';
import Target from '@/utils/types/target';
import { SKA_SENSITIVITY_CALCULATOR_API_URL, STATUS_ERROR } from '@/utils/constants';

const Fetch = async (
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  telescope: Telescope,
  baseUrl: string,
  properties: string,
  mapping: Function,
  target: Target,
  observation?: Observation
) => {
  try {
    let finalURL = `${SKA_SENSITIVITY_CALCULATOR_API_URL}${telescope.code}${baseUrl}`;
    finalURL += properties;
    const result = await authAxiosClient.get(finalURL);
    return mapping(result.data, target, observation);
  } catch (e) {
    const errMsg = e?.response?.data ? e.response.data : e.toString();
    const title = errMsg?.title?.length ? errMsg.title : 'Sensitivity Calculator API error';
    const results = errMsg.detail?.length ? errMsg.detail : e?.message?.length ? e.message : errMsg;
    return {
      id: 1,
      statusGUI: STATUS_ERROR,
      error: title,
      results: results
    };
  }
};
export default Fetch;
