import {
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { MockProposalBackend } from '../getProposal/mockProposalBackend';
import MappingPutProposal from './putProposalMapping';
import Proposal, { ProposalBackend } from '@/utils/types/proposal';

export function mockPutProposal() {
  return MockProposalBackend; // TODO check if this is the correct mock return value
}

async function PutProposal(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  proposal: Proposal,
  status?: string
): Promise<ProposalBackend | { error: string }> {
  if (USE_LOCAL_DATA) {
    return mockPutProposal();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/${proposal.id}`;
    // TODO: add testing for proposal conversion format
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
