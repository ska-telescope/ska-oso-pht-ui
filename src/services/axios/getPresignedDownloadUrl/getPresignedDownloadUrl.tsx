import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA } from '@/utils/constants.ts';

async function GetPresignedDownloadUrl(selectedFile) {
  if (USE_LOCAL_DATA) {
    return 'https://dagrs.berkeley.edu/sites/default/files/2020-01/sample.pdf';
  }

  try {
    const URL_PATH = `/download/signedurl/${selectedFile}`;
    const result = await axios.get(`${SKA_PHT_API_URL}${URL_PATH}`, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return e.message;
  }
}

export default GetPresignedDownloadUrl;
