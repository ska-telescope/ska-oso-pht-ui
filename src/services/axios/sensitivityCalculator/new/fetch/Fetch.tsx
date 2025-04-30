import { t } from 'i18next';
import axios from 'axios';
/*
import {
  ContinuumData,
  PSSData,
  StandardData,
  Telescope,
  ZoomData
} from '../../../utils/types/data.tsx';
*/
import {
  API_VERSION,
  AXIOS_CONFIG,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  STATUS_ERROR
} from '../../../../../utils/constants';

declare const window: {
  env: {
    BACKEND_URL: string;
  };
} & Window;

// TODO : This needs to be changed to use the FETCH API, however when tried it threw a CORS error.

const Fetch = async (
  telescope: string,
  baseUrl: string,
  properties: string,
  mapping: Function,
  inDataS: any, // StandardData | null,
  inData: any // ContinuumData | ZoomData | PSSData | null
) => {
  console.log('::: in Fetch :::');
  console.log('::: Fetch', telescope, baseUrl, properties, inDataS, inData);
  try {
    // const baseURL = window.env.BACKEND_URL + API_VERSION;
    const baseURL = SKA_SENSITIVITY_CALCULATOR_API_URL;
    console.log('::: baseURL', baseURL);
    let finalURL = `${baseURL}${telescope}${baseUrl}`;
    console.log('::: finalURL', finalURL);
    finalURL += properties;
    const result = await axios.get(finalURL, AXIOS_CONFIG);
    return result.data;
    // return mapping(result.data, inDataS, inData);
  } catch (e) {
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
