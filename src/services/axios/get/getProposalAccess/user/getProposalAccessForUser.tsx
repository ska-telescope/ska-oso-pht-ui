import useAxiosAuthClient from '../../../axiosAuthClient/axiosAuthClient';
import MockProposalAccessBackend from '../mockProposalAccessBackend';
import ProposalAccess, { ProposalAccessBackend } from '@/utils/types/proposalAccess';
import { USE_LOCAL_DATA, OSO_SERVICES_PROPOSAL_ACCESS_PATH } from '@/utils/constants';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mappingList(inRec: ProposalAccessBackend[]): ProposalAccess[] {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: ProposalAccess = {
      id: inRec[i].access_id,
      prslId: inRec[i].prsl_id?.toString(),
      userId: inRec[i].user_id,
      role: inRec[i].role,
      permissions: inRec[i].permissions
    };
    output.push(rec);
  }
  return output as ProposalAccess[];
}

/*****************************************************************************************************************************/

export function GetMockProposalAccessForUser(): ProposalAccess[] {
  return mappingList(MockProposalAccessBackend);
}

async function GetProposalAccessForUser(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>
): Promise<ProposalAccess[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposalAccessForUser();
  }

  try {
    const result = await authAxiosClient.get(`${OSO_SERVICES_PROPOSAL_ACCESS_PATH}/user`);
    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }
    return mappingList(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposalAccessForUser;
