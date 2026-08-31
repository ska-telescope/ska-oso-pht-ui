import { AxiosAuthClient } from '../../../axiosAuthClient/axiosAuthClient';
import MockProposalAccessBackend from '../mockProposalAccessBackend';
import { mappingList } from '../mappingList';
import ProposalAccess from '@/utils/types/proposalAccess';
import { OSO_SERVICES_PROPOSAL_ACCESS_PATH } from '@/utils/constants';

/*****************************************************************************************************************************/

export function GetMockProposalAccessForUser(): ProposalAccess[] {
  return mappingList(MockProposalAccessBackend);
}

async function GetProposalAccessForUser(
  authAxiosClient: AxiosAuthClient
): Promise<ProposalAccess[] | string> {
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
