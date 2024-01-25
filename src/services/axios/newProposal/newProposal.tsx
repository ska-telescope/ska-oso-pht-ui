import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import { Proposal } from '../../types/proposal';

async function NewProposal(_inData: Proposal) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_NEW = `/proposal`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return 'OK - Local Data';
  }

  try {
    const result = await axios.post(`${apiUrl}${URL_NEW}`, _inData, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default NewProposal;
