import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import { helpers } from '../../../utils/helpers';

async function PutProposal(proposal, status?) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_EDIT = `/proposals/${proposal.id}`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return 'success';
  }

  // TODO: add testing for proposal conversion format
  const convertedProposal = helpers.transform.convertProposalToBackendFormat(proposal, status);

  try {
    const result = await axios.put(`${apiUrl}${URL_EDIT}`, convertedProposal, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PutProposal;
