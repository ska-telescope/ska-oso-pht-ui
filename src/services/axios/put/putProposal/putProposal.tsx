import {
  cypressToken,
  cypressLiveMode,
  OSO_SERVICES_PROPOSAL_PATH,
  PROPOSAL_STATUS,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.ts';
import MappingPutProposal from './putProposalMapping.tsx';
import { MockProposalFrontend } from './mockProposalFrontend.tsx';

export function mockPutProposal() {
  return MappingPutProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
}

async function PutProposal(
  authAxiosClient: AxiosAuthClient,
  proposal: Proposal,
  status?: string
): Promise<ProposalBackend | { error: string }> {
  // See getProposalsReviewable.tsx - cypressToken alone would also catch live-mode Cypress runs.
  if (USE_LOCAL_DATA || (cypressToken && !cypressLiveMode)) {
    return mockPutProposal();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/${proposal.id}`;
    const convertedProposal = MappingPutProposal(proposal, status as string);

    const result = await authAxiosClient.put(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}`,
      convertedProposal
    );
    return !result || !result?.data ? { error: 'error.API_UNKNOWN_ERROR' } : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutProposal;
