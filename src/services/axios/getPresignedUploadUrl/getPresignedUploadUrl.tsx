import axiosClient from '../axiosClient/axiosClient';
import { USE_LOCAL_DATA } from '../../../utils/constants';

async function GetPresignedUploadUrl(filename: string): Promise<string> {
  if (USE_LOCAL_DATA) {
    return 'https://httpbin.org/put';
  }

  try {
    const URL_PATH = `/upload/signedurl/${filename}`;
    const result = await axiosClient.get(URL_PATH);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return e.message;
  }
}

export default GetPresignedUploadUrl;
