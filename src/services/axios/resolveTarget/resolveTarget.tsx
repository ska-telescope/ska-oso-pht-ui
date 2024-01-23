import axios from 'axios';
import { SKA_PHT_API_URL } from '../../../utils/constants';

async function ResolveTarget(targetName) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_RESOLVE = `/coordinates/`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await axios.get(`${apiUrl}${URL_RESOLVE}${targetName}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
        return { error: e.message};
    
  }
}

export default ResolveTarget;
