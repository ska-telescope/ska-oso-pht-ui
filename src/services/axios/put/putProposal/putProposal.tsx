import {
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import MappingPutProposal from './putProposalMapping.tsx';
import { MockProposalFrontend } from './mockProposalFrontend.tsx';

export function mockPutProposal() {
  return MappingPutProposal(MockProposalFrontend, 'draft');
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
    const convertedProposal = MappingPutProposal(proposal, status as string);
    console.log('CONVERTED PUT PROPOSAL', { convertedProposal });
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
