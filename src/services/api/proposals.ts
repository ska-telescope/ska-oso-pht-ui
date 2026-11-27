import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

/*
 * The proposal being edited. These calls take and give the PDM; the form's values are mapped to
 * and from it by useProposalOda (see models/proposals/pdmMapper).
 */

/** The PDM with the save metadata for the given status. */
const withSaveMetadata = (pdm: ProposalPDM, status: string): ProposalPDM => {
  const submitted = status === PROPOSAL_STATUS.SUBMITTED;
  return {
    ...pdm,
    // Save metadata, not proposal content. submitted_on is null when not submitted, as the ODA
    // does not accept ''
    status: status as ProposalPDM['status'],
    submitted_on: submitted ? new Date().toISOString() : null,
    submitted_by: submitted ? getUserId() : ''
  };
};

/** Fetches the proposal from the ODA in its PDM shape. */
export const getProposal = (id: string): Promise<ApiResult<ProposalPDM>> =>
  callApi(() => api.proposals.getProposalOsoApiV17PhtPrslsPrslIdGet(id));

/** Saves the proposal to the ODA, with the given status. */
export const updateProposal = (
  pdm: ProposalPDM,
  status: string = PROPOSAL_STATUS.DRAFT
): Promise<ApiResult<ProposalPDM>> =>
  callApi(() => {
    const payload = withSaveMetadata(pdm, status);
    return api.proposals.updateProposalOsoApiV17PhtPrslsPrslIdPut(
      payload.prsl_id as string,
      payload
    );
  });

/**
 * Creates a proposal in the ODA, as a draft. The PDM holds the new proposal's own ID, minted with
 * SKUID when it was started or cloned.
 *
 * The backend adds the caller as an accepted PI and returns the proposal as stored.
 */
export const createProposal = (pdm: ProposalPDM): Promise<ApiResult<ProposalPDM>> =>
  callApi(() =>
    api.proposals.createProposalOsoApiV17PhtPrslsCreatePost(
      withSaveMetadata(pdm, PROPOSAL_STATUS.DRAFT)
    )
  );

/** Whether the ODA finds the proposal valid, and if not, why. */
export interface ProposalValidation {
  valid: boolean;
  errors: string[];
}

// The generated client types the validate response as any object, so its shape is given here
interface ValidateResponseData {
  result: boolean;
  validation_errors?: string[];
}

/** Asks the ODA whether the proposal is valid, as it would be saved as a draft. */
export const validateProposal = (pdm: ProposalPDM): Promise<ApiResult<ProposalValidation>> =>
  callApi(
    () =>
      api.proposals.validateProposalOsoApiV17PhtPrslsValidatePost(
        withSaveMetadata(pdm, PROPOSAL_STATUS.DRAFT)
      ),
    (data) => {
      const response = data as unknown as ValidateResponseData;
      if (typeof response.result !== 'boolean') {
        throw new Error(UNKNOWN_API_ERROR);
      }
      return { valid: response.result, errors: response.validation_errors ?? [] };
    }
  );
