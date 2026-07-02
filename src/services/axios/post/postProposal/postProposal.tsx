import { helpers } from '@utils/helpers.ts';
import {
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  TEAM_STATUS_TYPE_OPTIONS,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import Proposal from '@utils/types/proposal.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import { mapping } from '../../get/getProposal/getProposal.tsx';
import MappingPutProposal from '../../put/putProposal/putProposalMapping.tsx';
import { MockProposalBackend } from './mockProposalBackend.tsx';

export function mockPostProposal() {
  return mapping(MockProposalBackend);
}

async function PostProposal(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  proposal: Proposal,
  status?: string
): Promise<Proposal | { error: string }> {
  if (USE_LOCAL_DATA) {
    return mockPostProposal();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/create`;
    // Use the full mapping so cloned proposals carry all content (targets, observations, etc.).
    // prsl_id is omitted — the backend generates a fresh SKUID on /create.
    // investigator_refs is omitted — the backend builds it from the investigators in proposal_info.
    // investigator status is reset to 'Pending' — invitation to the new proposal is fresh.
    // result_details is reset to [] — sensitivity-calc results are stale for a new proposal.
    const { prsl_id: _omit, investigator_refs: _invRefs, ...mapped } = MappingPutProposal(proposal, status as string);
    const convertedProposal = helpers.transform.trimObject({
      ...mapped,
      proposal_info: {
        ...mapped.proposal_info,
        investigators: mapped.proposal_info.investigators?.map(
          ({ status: _s, ...inv }) => ({ ...inv, status: TEAM_STATUS_TYPE_OPTIONS.pending })
        ) ?? []
      },
      observation_info: {
        ...mapped.observation_info,
        result_details: []
      }
    });

    const result = await authAxiosClient.post(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}`,
      convertedProposal
    );
    return !result || !result?.data ? { error: 'error.API_UNKNOWN_ERROR' } : mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostProposal;
