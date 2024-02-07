import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

async function GetCoordinates(targetName) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_COORDINATES = `/coordinates/`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    if (targetName === 'M1') {
      return '5:34:30.9 22:00:53';
    }
    return { error: 'Name Not Found' };
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_COORDINATES}${targetName}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetCoordinates;
