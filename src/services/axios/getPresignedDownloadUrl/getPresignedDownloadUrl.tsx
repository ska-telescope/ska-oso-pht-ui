import axiosClient from '../axiosClient/axiosClient';
import { USE_LOCAL_DATA } from '../../../utils/constants';

async function GetPresignedDownloadUrl(selectedFile) {
  if (USE_LOCAL_DATA) {
    return 'https://dagrs.berkeley.edu/sites/default/files/2020-01/sample.pdf';
  }

  try {
    const URL_PATH = `/download/signedurl/${selectedFile}`;
    const result = await axiosClient.get(URL_PATH);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return e.message;
  }
}

export default GetPresignedDownloadUrl;
