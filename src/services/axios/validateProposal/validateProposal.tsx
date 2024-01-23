import axios from 'axios';
import { SKA_PHT_API_URL } from '../../../utils/constants';

async function ValidateProposal(proposal) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_VALIDATE = `/proposal/validate`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await axios.post(`${apiUrl}${URL_VALIDATE}`, proposal, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default ValidateProposal;
