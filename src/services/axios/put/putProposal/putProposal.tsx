import {
  OSO_SERVICES_PROPOSAL_PATH,
  PROPOSAL_STATUS,
  SKA_OSO_SERVICES_URL
} from '@utils/constants.ts';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.ts';
import MappingPutProposal from './putProposalMapping.tsx';
import { MockProposalFrontend } from './mockProposalFrontend.tsx';
import type { ProposalType } from '@/models/proposals/proposal';
import { mapFormToPdm } from '@/models/proposals/pdmMapper';
import { clearProposalFormBackup } from '@/models/proposals/proposalFormBackupStorage';

export function mockPutProposal() {
  return MappingPutProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
}

async function PutProposal(
  authAxiosClient: AxiosAuthClient,
  proposal: Proposal,
  status?: string,
  formValues?: ProposalType
): Promise<ProposalBackend | { error: string }> {
  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/${proposal.id}`;
    const convertedProposal = MappingPutProposal(proposal, status as string);
    const payload = formValues ? mapFormToPdm(formValues, convertedProposal) : convertedProposal;

    const result = await authAxiosClient.put(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, payload);
    if (!result || !result?.data) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    clearProposalFormBackup(proposal.id);
    return result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutProposal;
