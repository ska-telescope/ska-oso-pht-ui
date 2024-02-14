import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import MockProposals from './mockProposals';

async function GetProposalList() {
  const apiUrl = SKA_PHT_API_URL;
  const URL_LIST = '/proposal/list';
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // TODO - Need to strip out the true from this if statement

  if (true || USE_LOCAL_DATA) {
    return MockProposals;
  }

  // TODO: create a conversion function to convert backend format proposals list to display in front-end

  try {
    const result = await axios.get(`${apiUrl}${URL_LIST}`, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetProposalList;
