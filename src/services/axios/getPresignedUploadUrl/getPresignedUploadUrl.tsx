import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

async function GetPresignedUploadUrl(filename: string): Promise<string> {
  const apiUrl = SKA_PHT_API_URL;
  const URL_GET = `/upload/signedurl/`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return 'https://httpbin.org/put';
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_GET}${filename}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return e.message;
  }
}

export default GetPresignedUploadUrl;
