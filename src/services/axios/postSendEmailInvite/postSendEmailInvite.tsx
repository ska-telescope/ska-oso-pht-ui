import { OSO_SERVICES_PROPOSAL_PATH, SKA_OSO_SERVICES_URL } from '../../../utils/constants';
import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { EmailInviteBackend } from '@/utils/types/emailInvite.tsx';

async function PostSendEmailInvite(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  email: EmailInviteBackend
) {
  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/send-email`;

    const result = await authAxiosClient.post(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, email);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostSendEmailInvite;
