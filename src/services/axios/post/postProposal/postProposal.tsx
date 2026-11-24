import { PROPOSAL_STATUS, SENSITIVITY_STATE, TEAM_STATUS_TYPE_OPTIONS } from '@utils/constants.ts';
import { type ApiResult, handleApiError, UNKNOWN_API_ERROR } from '../../apiResult/apiResult.ts';
import { osoApiConfiguration } from '../../generatedClient/osoApiConfig.ts';
import type { ProposalType } from '@/models/proposals/proposal';
import { mapFormToPdm } from '@/models/proposals/pdmMapper';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { PPTAPIProposalPreparationApiFactory } from '@/generated';

/**
 * Creates a proposal in the ODA from the form's values, as a draft. The form holds the new
 * proposal's own ID, minted with SKUID when it was started or cloned.
 *
 * The backend adds the caller as an accepted PI and returns the proposal as stored.
 */
async function PostProposal(values: ProposalType): Promise<ApiResult<ProposalPDM>> {
  try {
    // A new proposal keeps its links but not their sensitivity results, which are stale for it.
    // A link that isn't calculated is saved with its references only, and is recalculated on load.
    const pdm = mapFormToPdm({
      ...values,
      targetObservation: values.targetObservation.map((link) => ({
        ...link,
        sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
      }))
    });
    const payload: ProposalPDM = {
      ...pdm,
      // Invitations to the new proposal start afresh, so every investigator is pending
      proposal_info: {
        ...pdm.proposal_info,
        investigators: pdm.proposal_info.investigators?.map((investigator) => ({
          ...investigator,
          status: TEAM_STATUS_TYPE_OPTIONS.pending
        }))
      },
      // Save metadata, not form state. submitted_on is null, as the ODA does not accept ''
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
