import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { handleApiError, UNKNOWN_API_ERROR } from '../../apiResult/apiResult.ts';
import { osoApiConfiguration } from '../../generatedClient/osoApiConfig.ts';
import type { ProposalType } from '@/models/proposals/proposal';
import { mapFormToPdm } from '@/models/proposals/pdmMapper';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { PPTAPIProposalPreparationApiFactory } from '@/generated';

// The generated client types the response as any object, so its shape is given here
export interface ValidateResponseData {
  result: boolean;
  validation_errors: string[];
}

export interface ValidateServiceResponse {
  error?: string[];
  valid?: string;
}

/** Asks the ODA whether the proposal held in the form is valid, as it would be saved. */
async function PostProposalValidate(values: ProposalType): Promise<ValidateServiceResponse> {
  try {
    const payload: ProposalPDM = {
      ...mapFormToPdm(values),
      status: PROPOSAL_STATUS.DRAFT as ProposalPDM['status'],
      submitted_on: null,
      submitted_by: ''
    };
    const result =
      await PPTAPIProposalPreparationApiFactory(
        osoApiConfiguration
      ).validateProposalOsoApiV17PhtPrslsValidatePost(payload);

    const validateResponseData = result?.data as ValidateResponseData | undefined;
    if (typeof validateResponseData?.result !== 'boolean') {
      return { error: [UNKNOWN_API_ERROR] };
    }
    if (!validateResponseData.result) {
      return { error: validateResponseData.validation_errors };
    }
    return { valid: 'success' };
  } catch (err) {
    return { error: [handleApiError(err).error ?? UNKNOWN_API_ERROR] };
  }
}

export default PostProposalValidate;
