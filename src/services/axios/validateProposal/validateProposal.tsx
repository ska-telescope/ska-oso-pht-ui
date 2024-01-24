import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

async function ValidateProposal(proposal) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_VALIDATE = `/proposal/validate`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return 'OK - Local DATA';
  }

  try {
    const result = await axios.post(`${apiUrl}${URL_VALIDATE}`, proposal, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default ValidateProposal;
