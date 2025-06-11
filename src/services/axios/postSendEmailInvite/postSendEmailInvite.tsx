import {
  AXIOS_CONFIG,
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_PHT_API_URL
} from '../../../utils/constants';
import axios from 'axios';
import { EmailInviteBackend } from '../../../utils/types/emailInvite';

async function PostSendEmailInvite(email: EmailInviteBackend) {
  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/send-email`;

    const result = await axios.post(`${SKA_PHT_API_URL}${URL_PATH}`, email, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PostSendEmailInvite;
