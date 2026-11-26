import React from 'react';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { GetProposalPdm, mapping } from '@services/axios/get/getProposal/getProposal';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { ProposalType } from './proposal';
import { mapPdmToForm } from './pdmMapper';
import { withSvDefaults } from '@/utils/autoLinking/AutoLinking';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

/**
 * Moves the proposal between the ODA (PDM) and the global proposal form (RHF).
 * Fields not yet migrated to the form still travel through the legacy store mappings.
 */
export function useProposalOda() {
  const { axiosClient: authClient } = useAxiosAuthClient();

  const form = useFormContext<ProposalType>() as UseFormReturn<ProposalType> | null;
  const { osdPolicies } = useOSDAccessors();

  const loadFromOda = React.useCallback(
    async (
      id: string,
      isStillWanted: () => boolean = () => true
    ): Promise<Proposal | string | null> => {
      const pdm = await GetProposalPdm(authClient, id);
      // The form is shared across routes, so a superseded load must not reset it; null means skipped
      if (!isStillWanted()) {
        return null;
      }
      if (typeof pdm === 'string') {
        return pdm;
      }
      let proposal: Proposal;
      let values: ProposalType;
      try {
        proposal = mapping(pdm);
        // The proposal's own cycle, as it is only selected once the proposal has loaded
        const policy = osdPolicies.find((p) => p.cycleInformation?.cycleId === pdm.cycle);
        values = withSvDefaults(
          mapPdmToForm(pdm),
          policy?.capabilities?.low?.basicCapabilities?.minElevationDeg ?? null
        );
      } catch (error) {
        return error instanceof Error ? error.message : 'error.API_UNKNOWN_ERROR';
      }
      form?.reset(values);
      return proposal;
    },
    [authClient, form, osdPolicies]
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
