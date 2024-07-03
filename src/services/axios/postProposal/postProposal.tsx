import axios from 'axios';
import { helpers } from '../../../utils/helpers';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import Proposal from '../../../utils/types/proposal';

async function PostProposal(proposal: Proposal, status?: string) {
  if (USE_LOCAL_DATA) {
    return 'PROPOSAL-ID-001';
  }

  try {
    const URL_PATH = `/proposals`;
    const convertedProposal = helpers.transform.convertProposalToBackendFormat(proposal, status);

    const result = await axios.post(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostProposal;
