import { t } from 'i18next';
import axios from 'axios';
import {
  ContinuumData,
  PSSData,
  StandardData,
  Telescope,
  ZoomData
} from '../../../utils/types/data.tsx';
import { API_VERSION, AXIOS_CONFIG, STATUS_ERROR } from '../../../utils/constants.ts';

declare const window: {
  env: {
    BACKEND_URL: string;
  };
} & Window;

// TODO : This needs to be changed to use the FETCH API, however when tried it threw a CORS error.

const Fetch = async (
  telescope: Telescope,
  baseUrl: string,
  properties: string,
  mapping: Function,
  inDataS: StandardData | null,
  inData: ContinuumData | ZoomData | PSSData | null
) => {
  try {
    const baseURL = window.env.BACKEND_URL + API_VERSION;
    let finalURL = `${baseURL}/${telescope.code}${baseUrl}`;
    finalURL += properties;
    const result = await axios.get(finalURL, AXIOS_CONFIG);
    return mapping(result.data, inDataS, inData);
  } catch (e: any) {
    const errMsg = e?.response?.data ? e.response.data : e.toString();
    const title = errMsg?.title?.length ? errMsg.title : t('api.error');
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
