import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import MockProposals from './mockProposals';

async function GetProposals() {
  const apiUrl = SKA_PHT_API_URL;
  const URL_LIST = '/proposals';
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return MockProposals;
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_LIST}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result;
  } catch (e) {
    return 'error.API_NOT_AVAILABLE';
  }
}

export default GetProposals;
