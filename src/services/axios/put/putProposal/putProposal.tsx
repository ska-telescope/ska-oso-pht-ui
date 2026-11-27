import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import { type ApiResult, handleApiError, UNKNOWN_API_ERROR } from '../../apiResult/apiResult.ts';
import { osoApiConfiguration } from '../../generatedClient/osoApiConfig.ts';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { PPTAPIProposalPreparationApiFactory } from '@/generated';

/** Saves the proposal to the ODA in its PDM shape, with the given status. */
async function PutProposal(
  pdm: ProposalPDM,
  status: string = PROPOSAL_STATUS.DRAFT
): Promise<ApiResult<ProposalPDM>> {
  try {
    const submitted = status === PROPOSAL_STATUS.SUBMITTED;
    const payload: ProposalPDM = {
      ...pdm,
      // Save metadata, not proposal content. submitted_on is null when not submitted, as the ODA
      // does not accept ''
      status: status as ProposalPDM['status'],
      submitted_on: submitted ? new Date().toISOString() : null,
      submitted_by: submitted ? getUserId() : ''
    };

    const result = await PPTAPIProposalPreparationApiFactory(
      osoApiConfiguration
    ).updateProposalOsoApiV17PhtPrslsPrslIdPut(payload.prsl_id as string, payload);
    return result?.data ? { data: result.data } : { error: UNKNOWN_API_ERROR };
  } catch (err) {
    return handleApiError(err);
  }
}

export default PutProposal;
