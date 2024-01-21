import axios from 'axios';
import { SKA_PHT_API_URL } from '../../../utils/constants';
import { Proposal } from '../../types/proposal';

async function AddProposalToDB(_inData: Proposal) {
  const apiUrl = SKA_PHT_API_URL;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await axios.post(`${apiUrl}`, _inData, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default AddProposalToDB;
