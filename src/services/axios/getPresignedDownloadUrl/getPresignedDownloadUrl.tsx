import axios from 'axios';
import {
  AXIOS_CONFIG,
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';

async function GetPresignedDownloadUrl(selectedFile: string) {
  if (USE_LOCAL_DATA) {
    return 'https://dagrs.berkeley.edu/sites/default/files/2020-01/sample.pdf';
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/signed-url/download/${selectedFile}`;
    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return e.message;
  }
}

export default GetPresignedDownloadUrl;
