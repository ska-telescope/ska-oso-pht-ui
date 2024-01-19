import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import MockProposals from './mockProposals';

async function GetProposals() {
  const apiUrl = SKA_PHT_API_URL;
  const URL_LIST = '/list';
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
    // const result = await axios.get(`${apiUrl}${URL_LIST}`, config); // list proposals // works
    // const result = await axios.get(`${apiUrl}`, config); // proposal // works
    const result = await axios.put(`${apiUrl}`, config); // put proposal
    // const result = await axios.post(`${apiUrl}`, config); // post proposal
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetProposals;
