import axios from 'axios';
import { helpers } from '../../../utils/helpers';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import { Proposal } from '../../types/proposal';

async function PostProposal(proposal: Proposal, status?) {
  const apiUrl = SKA_PHT_API_URL;
  const URL_NEW = `/proposal`;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  const convertedProposal = helpers.transform.convertProposalToBackendFormat(proposal, status);

  if (USE_LOCAL_DATA) {
    return 'PROPOSAL-ID-001';
  }

  try {
    const result = await axios.post(`${apiUrl}${URL_NEW}`, convertedProposal, config);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostProposal;
