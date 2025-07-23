import {
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import axiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { MockProposalFrontend } from '../getProposal/mockProposalFrontend';
import MappingPutProposal from './putProposalMapping';
import Proposal from '@/utils/types/proposal';

export function mockPutProposal() {
  return MockProposalFrontend; // TODO check if this is the correct mock return value
}

async function PutProposal(
  proposal: Proposal,
  status?: string
): Promise<Proposal | { error: string }> {
  if (USE_LOCAL_DATA) {
    mockPutProposal();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/${proposal.id}`;
    // TODO: add testing for proposal conversion format
    const convertedProposal = MappingPutProposal(proposal, status as string);
    const result = await axiosAuthClient.put(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}`,
      convertedProposal
    );
    return !result ? { error: 'error.API_UNKNOWN_ERROR' } : result.data; // TODO: put back !result || !result?.data condition
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutProposal;
