import axios from 'axios';
import {
  AXIOS_CONFIG,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  STATUS_ERROR
} from '../../../utils/constants';
import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import { ContinuumData, PSSData, StandardData, ZoomData } from 'utils/types/typesSensCalc';
import Target from 'utils/types/target';
import Observation from 'utils/types/observation';

const Fetch = async (
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
    // const baseURL = window.env.BACKEND_URL + API_VERSION;
    const baseURL = SKA_SENSITIVITY_CALCULATOR_API_URL;
    let finalURL = `${baseURL}${telescope.code}${baseUrl}`;
    finalURL += properties;
    const result = await axios.get(finalURL, AXIOS_CONFIG);
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
