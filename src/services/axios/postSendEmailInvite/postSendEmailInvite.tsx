import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL } from '@/utils/constants.ts';
import { EmailInviteBackend } from '@/utils/types/emailInvite.tsx';

async function PostSendEmailInvite(email: EmailInviteBackend) {
  try {
    const URL_PATH = `/send-email`;

    const result = await axios.post(`${SKA_PHT_API_URL}${URL_PATH}`, email, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostSendEmailInvite;
