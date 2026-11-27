import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { type ApiResult, handleApiError, UNKNOWN_API_ERROR } from '../../apiResult/apiResult.ts';
import { osoApiConfiguration } from '../../generatedClient/osoApiConfig.ts';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { PPTAPIProposalPreparationApiFactory } from '@/generated';

/**
 * Creates a proposal in the ODA from its PDM shape, as a draft. The PDM holds the new proposal's
 * own ID, minted with SKUID when it was started or cloned.
 *
 * The backend adds the caller as an accepted PI and returns the proposal as stored.
 */
async function PostProposal(pdm: ProposalPDM): Promise<ApiResult<ProposalPDM>> {
  try {
    const payload: ProposalPDM = {
      ...pdm,
      // Save metadata, not proposal content. submitted_on is null, as the ODA does not accept ''
      status: PROPOSAL_STATUS.DRAFT as ProposalPDM['status'],
      submitted_on: null,
      submitted_by: ''
    };

    const result =
      await PPTAPIProposalPreparationApiFactory(
        osoApiConfiguration
      ).createProposalOsoApiV17PhtPrslsCreatePost(payload);
    return result?.data ? { data: result.data } : { error: UNKNOWN_API_ERROR };
  } catch (err) {
    return handleApiError(err);
  }
}

export default PostProposal;
