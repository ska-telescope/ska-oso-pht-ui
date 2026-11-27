import React from 'react';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import { PROPOSAL_STATUS, SENSITIVITY_STATE, TEAM_STATUS_TYPE_OPTIONS } from '@utils/constants.ts';
import { GetProposal } from '@services/axios/get/getProposal/getProposal';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import PostProposal from '@services/axios/post/postProposal/postProposal';
import { type ApiResult, UNKNOWN_API_ERROR } from '@services/axios/apiResult/apiResult';
import { useRefreshAuthToken } from '@services/axios/axiosAuthClient/axiosAuthClient';
import { ProposalType } from './proposal';
import { mapFormToPdm, mapPdmToForm } from './pdmMapper';
import { withSvDefaults } from '@/utils/autoLinking/AutoLinking';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';

/**
 * The PDM to create a new proposal from the given form values. The new proposal keeps its links
 * but not their sensitivity results, which are stale for it (a link that isn't calculated is
 * saved with its references only, and is recalculated on load). Invitations to it start afresh,
 * so every investigator is pending.
 */
function newProposalPdm(values: ProposalType): ProposalPDM {
  const pdm = mapFormToPdm({
    ...values,
    targetObservation: values.targetObservation.map((link) => ({
      ...link,
      sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
    }))
  });
  return {
    ...pdm,
    proposal_info: {
      ...pdm.proposal_info,
      investigators: pdm.proposal_info.investigators?.map((investigator) => ({
        ...investigator,
        status: TEAM_STATUS_TYPE_OPTIONS.pending
      }))
    }
  };
}

// Maps form values to the PDM, returning a mapping failure (e.g. no proposal type) as an error
// rather than throwing, as the API calls do
function formToPdm(
  values: ProposalType,
  toPdm: (values: ProposalType) => ProposalPDM = mapFormToPdm
): ApiResult<ProposalPDM> {
  try {
    return { data: toPdm(values) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : UNKNOWN_API_ERROR };
  }
}

/**
 * Saves the given form values to the ODA, with the given status. For a caller outside the
 * proposal form (e.g. the one that provides it); others use saveToOda from useProposalOda.
 * TODO can we remove the call to this function in the PHT.tsx
 */
export async function saveValuesToOda(
  values: ProposalType,
  status: string = PROPOSAL_STATUS.DRAFT
): Promise<ApiResult<ProposalPDM>> {
  const { data: pdm, error } = formToPdm(values);
  return pdm ? PutProposal(pdm, status) : { error: error ?? UNKNOWN_API_ERROR };
}

/**
 * Moves the proposal between the ODA (PDM) and the global proposal form (RHF). A load or create
 * resets the form from the PDM the ODA returns, and a save sends the PDM mapped from the form.
 */
export function useProposalOda() {
  const form = useFormContext<ProposalType>() as UseFormReturn<ProposalType> | null;
  const refreshAuthToken = useRefreshAuthToken();
  const { osdPolicies } = useOSDAccessors();

  // Maps a proposal from the ODA to form values, adding the SV defaults a save may have left out,
  // and resets the form to them (so they are also its defaults, and it is no longer dirty). A
  // PDM the form can't hold (e.g. a required field missing) leaves the form as it was.
  const resetFormFromPdm = React.useCallback(
    (pdm: ProposalPDM): ApiResult<ProposalType> => {
      let values: ProposalType;
      try {
        // The proposal's own cycle, as it is only selected once the proposal has loaded
        const policy = osdPolicies.find((p) => p.cycleInformation?.cycleId === pdm.cycle);
        values = withSvDefaults(
          mapPdmToForm(pdm),
          policy?.capabilities?.low?.basicCapabilities?.minElevationDeg ?? null
        );
      } catch (err) {
        return { error: err instanceof Error ? err.message : UNKNOWN_API_ERROR };
      }
      form?.reset(values);
      return { data: values };
    },
    [form, osdPolicies]
  );

  /**
   * Loads a proposal into the form. The form is shared across routes, so a load the caller no
   * longer wants (isStillWanted false once the response arrives) leaves it alone and returns null.
   */
  const loadFromOda = React.useCallback(
    async (
      id: string,
      isStillWanted: () => boolean = () => true
    ): Promise<ApiResult<ProposalType> | null> => {
      const { data: pdm, error } = await GetProposal(id);
      if (!isStillWanted()) {
        return null;
      }
      return pdm ? resetFormFromPdm(pdm) : { error: error ?? UNKNOWN_API_ERROR };
    },
    [resetFormFromPdm]
  );

  const saveToOda = React.useCallback(
    async (status: string = PROPOSAL_STATUS.DRAFT): Promise<ApiResult<ProposalPDM>> =>
      // The proposal is saved from the form, so there is nothing to save without one
      form ? saveValuesToOda(form.getValues(), status) : { error: UNKNOWN_API_ERROR },
    [form]
  );

  /** Creates a proposal from the given values, then puts the proposal as created in the form. */
  const createInOda = React.useCallback(
    async (values: ProposalType): Promise<ApiResult<ProposalType>> => {
      const { data: newPdm, error: mapError } = formToPdm(values, newProposalPdm);
      if (!newPdm) {
        return { error: mapError ?? UNKNOWN_API_ERROR };
      }
      const { data: pdm, error } = await PostProposal(newPdm);
      if (!pdm) {
        return { error: error ?? UNKNOWN_API_ERROR };
      }
      // The backend has just made the caller a member of the new proposal. Awaited, so that the
      // next request (e.g. a page fetching on mount) carries a token that reflects it.
      await refreshAuthToken();
      return resetFormFromPdm(pdm);
    },
    [resetFormFromPdm, refreshAuthToken]
  );

  return { loadFromOda, saveToOda, createInOda };
}
