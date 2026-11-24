import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import { type ApiResult, handleApiError, UNKNOWN_API_ERROR } from '../../apiResult/apiResult.ts';
import { osoApiConfiguration } from '../../generatedClient/osoApiConfig.ts';
import type { ProposalType } from '@/models/proposals/proposal';
import { mapFormToPdm } from '@/models/proposals/pdmMapper';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { PPTAPIProposalPreparationApiFactory } from '@/generated';

/** Saves the proposal held in the form, with the given status. */
async function PutProposal(
  formValues: ProposalType,
  status: string = PROPOSAL_STATUS.DRAFT
): Promise<ApiResult<ProposalPDM>> {
  try {
    const submitted = status === PROPOSAL_STATUS.SUBMITTED;
    const payload: ProposalPDM = {
      ...mapFormToPdm(formValues),
      // Save metadata, not form state. submitted_on is null when not submitted, as the ODA does
      // not accept ''
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
