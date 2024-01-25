import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import MockProposal from './mockProposal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function GetProposal(_id: number) {
  const apiUrl = SKA_PHT_API_URL;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return MockProposal;
  }

  try {
    const result = await axios.get(`${apiUrl}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data.proposal.title;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetProposal;
