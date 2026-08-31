import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient';
import ProposalAccess, { ProposalAccessBackend } from '@/utils/types/proposalAccess';
import { OSO_SERVICES_PROPOSAL_ACCESS_PATH } from '@/utils/constants';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mapping(inRec: ProposalAccess): ProposalAccessBackend {
  return {
    access_id: inRec.id,
    prsl_id: inRec.prslId?.toString(),
    user_id: inRec.userId,
    role: inRec.role,
    permissions: inRec.permissions
  };
}

/*****************************************************************************************************************************/

async function PostProposalAccess(
  authAxiosClient: AxiosAuthClient,
  proposalAccess: ProposalAccess
): Promise<string | { error: string }> {
  try {
    const convertedProposalAccess = mapping(proposalAccess);
    const result = await authAxiosClient.post(
      `${OSO_SERVICES_PROPOSAL_ACCESS_PATH}/create`,
      convertedProposalAccess
    );
    if (!result || !result.data) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostProposalAccess;
