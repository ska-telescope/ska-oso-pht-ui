import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import { helpers } from '../../../utils/helpers';

async function PutProposal(proposal) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_EDIT = `/proposal`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (USE_LOCAL_DATA) {
    return 'OK - Local DATA';
  }

  // TODO: add testing for proposal conversion format
  const convertedProposal = helpers.transform.convertProposalToBackendFormat(proposal);

  try {
    const result = await axios.put(`${apiUrl}${URL_EDIT}`, convertedProposal, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PutProposal;
