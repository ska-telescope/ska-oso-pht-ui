import useAxiosAuthClient from '../../../axiosAuthClient/axiosAuthClient';
import MockProposalAccessBackend from '../mockProposalAccessBackend';
import { mappingList } from '../mappingList';
import ProposalAccess from '@/utils/types/proposalAccess';
import { USE_LOCAL_DATA, OSO_SERVICES_PROPOSAL_ACCESS_PATH } from '@/utils/constants';

/*****************************************************************************************************************************/

export function GetMockProposalAccessForProposal(): ProposalAccess[] {
  return mappingList(MockProposalAccessBackend);
}

async function GetProposalAccessForProposal(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  proposalId: string
): Promise<ProposalAccess[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposalAccessForProposal();
  }

  try {
    const result = await authAxiosClient.get(`${OSO_SERVICES_PROPOSAL_ACCESS_PATH}/${proposalId}`);
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

export default GetProposalAccessForProposal;
