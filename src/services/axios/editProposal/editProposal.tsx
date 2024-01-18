import axios from 'axios';
import { SKA_PHT_API_URL, USE_DUMMY_EDIT } from '../../../utils/constants';
import MockUpdatedProposal from './mockUpdatedProposal';

async function editProposal(proposalId, updatedProposal?) {
    const apiUrl = SKA_PHT_API_URL;
    const URL_EDIT = `/${proposalId}`;
    const config = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };

  console.log("api url", apiUrl);

  if (USE_DUMMY_EDIT) {
    updatedProposal = MockUpdatedProposal;
  }

  try {
    const result = await axios.put(`${apiUrl}`, updatedProposal, config);
    // http://127.0.0.1:5000/ska-oso-pht-services/pht/api/v1/proposal
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default editProposal;
