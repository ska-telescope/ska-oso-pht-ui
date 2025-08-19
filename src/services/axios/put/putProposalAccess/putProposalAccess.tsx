import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient';
import { mapping } from '../../post/postProposalAccess/postProposalAccess';
import MockProposalBackendAccess from './mockProposalAccessBackend';
import ProposalAccess, { ProposalAccessBackend } from '@/utils/types/proposalAccess';
import { USE_LOCAL_DATA, OSO_SERVICES_PROPOSAL_ACCESS_PATH } from '@/utils/constants';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mappingBackendToFrontend(inRec: ProposalAccessBackend): ProposalAccess {
  return {
    id: inRec.access_id,
    prslId: inRec.prsl_id?.toString(),
    userId: inRec.user_id,
    role: inRec.role,
    permissions: inRec.permissions
  };
}

/*****************************************************************************************************************************/

export function PutMockProposalAccess(): ProposalAccess {
  return mappingBackendToFrontend(MockProposalBackendAccess);
}

async function PutProposalAccess(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  proposalAccess: ProposalAccess
): Promise<ProposalAccess | { error: string }> {
  if (USE_LOCAL_DATA) {
    return PutMockProposalAccess();
  }

  try {
    const convertedProposalAccess = mapping(proposalAccess);
    const result = await authAxiosClient.put(
      `${OSO_SERVICES_PROPOSAL_ACCESS_PATH}/user/${convertedProposalAccess.access_id}`,
      convertedProposalAccess
    );
    if (!result || !result.data) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return mappingBackendToFrontend(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutProposalAccess;
