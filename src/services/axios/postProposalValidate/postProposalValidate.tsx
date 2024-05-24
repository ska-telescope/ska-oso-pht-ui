import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

async function PostProposalValidate(proposal) {
  if (USE_LOCAL_DATA) {
    return 'LOCAL DATA success';
  }

  try {
    const URL_PATH = `/proposals/validate`;
    const result = await axios.post(`${SKA_PHT_API_URL}${URL_PATH}`, proposal, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostProposalValidate;
