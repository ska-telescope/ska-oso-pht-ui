import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
import { helpers } from '../../../utils/helpers';

async function PostProposalValidate(proposal) {
  if (USE_LOCAL_DATA) {
    return 'LOCAL DATA success';
  }

  try {
    const URL_PATH = `/proposals/validate`;
    // TODO: add testing for proposal conversion format
    const convertedProposal = helpers.transform.convertProposalToBackendFormat(proposal, 'draft');
    const result = await axios.post(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    const errorMessage = `${e?.message}: ${e?.response?.data?.message}`;
    return { error: errorMessage };
  }
}

export default PostProposalValidate;
