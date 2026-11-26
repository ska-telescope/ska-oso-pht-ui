import { helpers } from '@utils/helpers.ts';
import {
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  TEAM_STATUS_TYPE_OPTIONS
} from '@utils/constants.ts';
import Proposal from '@utils/types/proposal.tsx';
import { AxiosAuthClient, RefreshAuthToken } from '../../axiosAuthClient/axiosAuthClient';
import { mapping } from '../../get/getProposal/getProposal.tsx';
import MappingPutProposal from '../../put/putProposal/putProposalMapping.tsx';
import { MockProposalBackend } from './mockProposalBackend.tsx';

export function mockPostProposal() {
  return mapping(MockProposalBackend);
}

async function PostProposal(
  authAxiosClient: AxiosAuthClient,
  refreshAuthToken: RefreshAuthToken,
  proposal: Proposal,
  status?: string
): Promise<Proposal | { error: string }> {
  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/create`;
    // Use the full mapping so cloned proposals carry all content (targets, observations, etc.).
    // The proposal comes with its prsl_id, minted with SKUID when it was started or cloned.
    // investigator_refs is omitted — the backend builds it from the investigators in proposal_info.
    // investigator status is reset to 'Pending' — invitation to the new proposal is fresh.
    // result_details is reset to [] — sensitivity-calc results are stale for a new proposal.
    const { investigator_refs: _invRefs, ...mapped } = MappingPutProposal(
      proposal,
      status as string
    );
    const convertedProposal = helpers.transform.trimObject({
      ...mapped,
      proposal_info: {
        ...mapped.proposal_info,
        investigators:
          mapped.proposal_info.investigators?.map(({ status: _s, ...inv }) => ({
            ...inv,
            status: TEAM_STATUS_TYPE_OPTIONS.pending
          })) ?? []
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
    if (!result || !result?.data) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    // The backend just granted this user admin group membership on the new proposal
    // (create_membership) - refresh so the next request's token actually reflects it.
    // Awaited: a caller-triggered request immediately after this returns (e.g. navigating to a
    // page that fetches on mount) would otherwise race this forced refresh for the same MSAL
    // account and can fail with login_required.
    await refreshAuthToken();
    return mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostProposal;
