import { AXIOS_CONFIG, SKA_PHT_API_URL } from '../../../utils/constants';
import axios from 'axios';

async function PostSendEmailInvite(email: { id: string; email: string }) {
  try {
    const URL_PATH = `/send-email`;

    const result = await axios.post(`${SKA_PHT_API_URL}${URL_PATH}`, email, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostSendEmailInvite;
