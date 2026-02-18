import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import Observation from '@/utils/types/observation';
import Target from '@/utils/types/target';
import { ContinuumData, PSSData, StandardData, ZoomData } from '@/utils/types/typesSensCalc';
import { SKA_SENSITIVITY_CALCULATOR_API_URL, STATUS_ERROR } from '@/utils/constants';

const Fetch = async (
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  telescope: Telescope,
  baseUrl: string,
  properties: string,
  mapping: Function,
  inDataS: StandardData | null,
  inData: ContinuumData | ZoomData | PSSData | null,
  target: Target,
  observation?: Observation
) => {
  try {
    const baseURL = SKA_SENSITIVITY_CALCULATOR_API_URL;
    let finalURL = `${baseURL}${telescope.code}${baseUrl}`;
    finalURL += properties;
    const result = await authAxiosClient.get(finalURL);
    return mapping(result.data, target, observation);
  } catch (e) {
    const errMsg = e?.response?.data ? e.response.data : e.toString();
    const title = errMsg?.title?.length ? errMsg.title : 'api.error';
    const results = errMsg.detail?.length ? errMsg.detail : e?.message?.length ? e.message : errMsg;
    return {
      id: 1,
      statusGUI: STATUS_ERROR,
      error: title,
      results: [results]
    };
  }
};
export default Fetch;
