import axiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { EmailInviteBackend } from '../../../utils/types/emailInvite';

async function PostSendEmailInvite(email: EmailInviteBackend) {
  try {
    const URL_PATH = `/send-email`;

    const result = await axiosAuthClient.post(URL_PATH);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostSendEmailInvite;
