import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import MockProposal from './mockProposal';
import { Proposal } from '../../types/proposal';

async function GetProposal() {
  const apiUrl = SKA_PHT_API_URL;
  const URL_LIST = '/proposal';
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // TODO : Do this properly
  if (USE_LOCAL_DATA) {
    return MockProposal as Proposal;
  }

  try {
    const result = await axios.get(`${apiUrl}${URL_LIST}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetProposal;
