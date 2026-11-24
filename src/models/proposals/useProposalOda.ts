import React from 'react';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { GetProposalPdm } from '@services/axios/get/getProposal/getProposal';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import PostProposal from '@services/axios/post/postProposal/postProposal';
import { type ApiResult, UNKNOWN_API_ERROR } from '@services/axios/apiResult/apiResult';
import { useRefreshAuthToken } from '@services/axios/axiosAuthClient/axiosAuthClient';
import { ProposalType } from './proposal';
import { mapPdmToForm } from './pdmMapper';
import { relinkSvTarget } from '@/utils/autoLinking/AutoLinking';

/**
 * Moves the proposal between the ODA (PDM) and the global proposal form (RHF). A load or create
 * resets the form from the PDM the ODA returns, and a save sends the PDM mapped from the form.
 */
export function useProposalOda() {
  const form = useFormContext<ProposalType>() as UseFormReturn<ProposalType> | null;
  const refreshAuthToken = useRefreshAuthToken();

  // Puts a proposal from the ODA in the form. A PDM the form can't hold (e.g. a required field
  // missing) leaves the form as it was.
  const applyPdm = React.useCallback(
    (pdm: ProposalBackend): ApiResult<ProposalType> => {
      let values: ProposalType;
      try {
        values = relinkSvTarget(mapPdmToForm(pdm));
      } catch (err) {
        return { error: err instanceof Error ? err.message : UNKNOWN_API_ERROR };
      }
      form?.reset(values);
      return { data: values };
    },
    [form]
  );

  const loadFromOda = React.useCallback(
    async (id: string): Promise<ApiResult<ProposalType>> => {
      const { data: pdm, error } = await GetProposalPdm(id);
      return pdm ? applyPdm(pdm) : { error: error ?? UNKNOWN_API_ERROR };
    },
    [applyPdm]
  );

  const saveToOda = React.useCallback(
    async (status: string = PROPOSAL_STATUS.DRAFT): Promise<ApiResult<ProposalBackend>> =>
      // The proposal is saved from the form, so there is nothing to save without one
      form ? PutProposal(form.getValues(), status) : { error: UNKNOWN_API_ERROR },
    [form]
  );

  /** Creates a proposal from the given values, then puts the proposal as created in the form. */
  const createInOda = React.useCallback(
    async (values: ProposalType): Promise<ApiResult<ProposalType>> => {
      const { data: pdm, error } = await PostProposal(values);
      if (!pdm) {
        return { error: error ?? UNKNOWN_API_ERROR };
      }
      // The backend has just made the caller a member of the new proposal. Awaited, so that the
      // next request (e.g. a page fetching on mount) carries a token that reflects it.
      await refreshAuthToken();
      return applyPdm(pdm);
    },
    [applyPdm, refreshAuthToken]
  );

  return { loadFromOda, saveToOda, createInOda };
}
