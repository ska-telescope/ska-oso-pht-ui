import axios from 'axios';
import {
  GENERAL,
  OBSERVATION,
  Projects,
  SKA_PHT_API_URL,
  TEAM_STATUS_TYPE_OPTIONS,
  USE_LOCAL_DATA
} from '../../../utils/constants';

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
    return 'test getPresignedDownloadUrl';
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_GET}${filename}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return e.message;
  }
}

export default GetPresignedUploadUrl;
