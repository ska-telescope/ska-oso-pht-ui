import React from 'react';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { GetProposalPdm, mapping } from '@services/axios/get/getProposal/getProposal';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { ProposalType } from './proposal';
import { mapPdmToForm } from './pdmMapper';

/**
 * Moves the proposal between the ODA (PDM) and the global proposal form (RHF).
 * Fields not yet migrated to the form still travel through the legacy store mappings.
 */
export function useProposalOda() {
  const { axiosClient: authClient } = useAxiosAuthClient();

  const form = useFormContext<ProposalType>() as UseFormReturn<ProposalType> | null;

  const loadFromOda = React.useCallback(
    async (id: string): Promise<Proposal | string> => {
      const pdm = await GetProposalPdm(authClient, id);
      if (typeof pdm === 'string') {
        return pdm;
      }
      form?.reset(mapPdmToForm(pdm));
      return mapping(pdm);
    },
    [authClient, form]
  );

  const saveToOda = React.useCallback(
    (
      proposal: Proposal,
      status: string = PROPOSAL_STATUS.DRAFT
    ): Promise<ProposalBackend | { error: string }> =>
      PutProposal(authClient, proposal, status, form?.getValues()),
    [authClient, form]
  );

  return { loadFromOda, saveToOda };
}
