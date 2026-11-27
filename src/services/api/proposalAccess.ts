import ProposalAccess from '@utils/types/proposalAccess.tsx';
import { proposalAccessFromPdm, proposalAccessToPdm } from '@/models/proposalAccess/proposalAccess';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

// A list response that isn't a list is malformed, so it is an error rather than an empty list
const accessFromList = (data: Parameters<typeof proposalAccessFromPdm>[0][]) => {
  if (!Array.isArray(data)) {
    throw new Error(UNKNOWN_API_ERROR);
  }
  return data.map(proposalAccessFromPdm);
};

/** The user's access to each of their proposals. */
export const listAccessForUser = (): Promise<ApiResult<ProposalAccess[]>> =>
  callApi(() => api.access.getAccessForUserOsoApiV17PhtProposalAccessUserGet(), accessFromList);

/** Every member's access to the given proposal. */
export const listAccessForProposal = (prslId: string): Promise<ApiResult<ProposalAccess[]>> =>
  callApi(
    () => api.access.getAccessByPrslIdOsoApiV17PhtProposalAccessPrslIdGet(prslId),
    accessFromList
  );

/** Gives a user access to a proposal, returning the new access's ID. */
export const createAccess = (access: ProposalAccess): Promise<ApiResult<string>> =>
  callApi(() =>
    api.access.postCreateAccessOsoApiV17PhtProposalAccessCreatePost(proposalAccessToPdm(access))
  );

/** Changes a user's access to a proposal, returning the access as stored. */
export const updateAccess = (access: ProposalAccess): Promise<ApiResult<ProposalAccess>> =>
  callApi(
    () =>
      api.access.updateAccessOsoApiV17PhtProposalAccessUserAccessIdPut(
        access.id,
        proposalAccessToPdm(access)
      ),
    proposalAccessFromPdm
  );
