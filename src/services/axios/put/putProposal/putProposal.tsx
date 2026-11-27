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
    // TODO: revisit submission requirements (submitted_on / submitted_by) once the proposal
    //  statuses have been refactored. For now the ODA needs them set on submission.
    const submitted = status === PROPOSAL_STATUS.SUBMITTED;
    const payload: ProposalPDM = {
      ...pdm,
      status: status as ProposalPDM['status'],
      ...(submitted && { submitted_on: new Date().toISOString(), submitted_by: getUserId() })
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
