import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

async function EditProposal(proposalId, updatedProposal?) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_EDIT = `/proposal/${proposalId}`; // API endpoint doesn't take ID yet?
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
    const result = await axios.put(`${apiUrl}${URL_EDIT}`, updatedProposal, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default EditProposal;
