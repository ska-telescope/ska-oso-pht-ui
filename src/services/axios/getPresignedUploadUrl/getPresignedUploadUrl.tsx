import axios from 'axios';
import {
  AXIOS_CONFIG,
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';

async function GetPresignedUploadUrl(filename: string): Promise<string> {
  if (USE_LOCAL_DATA) {
    return 'https://httpbin.org/put';
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/signed-url/upload/${filename}`;
    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return e.message;
  }
}

export default GetPresignedUploadUrl;
