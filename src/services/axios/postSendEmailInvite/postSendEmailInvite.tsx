import axiosClient from '../axiosClient/axiosClient';
import { EmailInviteBackend } from '../../../utils/types/emailInvite';

async function PostSendEmailInvite(email: EmailInviteBackend) {
  try {
    const URL_PATH = `/send-email`;

    const result = await axiosClient.post(URL_PATH);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostSendEmailInvite;
