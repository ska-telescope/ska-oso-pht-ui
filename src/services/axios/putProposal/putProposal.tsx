import axiosClient from '../axiosClient/axiosClient';
import { USE_LOCAL_DATA } from '../../../utils/constants';
import MappingPutProposal from './putProposalMapping';

interface PutProposalServiceResponse {
  error?: string;
  valid?: any;
}

async function PutProposal(proposal, status?): Promise<PutProposalServiceResponse> {
  if (USE_LOCAL_DATA) {
    return { valid: 'success' };
  }

  try {
    const URL_PATH = `/proposals/${proposal.id}`;
    // TODO: add testing for proposal conversion format
    const convertedProposal = MappingPutProposal(proposal, status);
    const result = await axiosClient.put(URL_PATH, convertedProposal);
    return typeof result === 'undefined' ? { error: 'error.API_UNKNOWN_ERROR' } : { valid: result };
  } catch (e) {
    return { error: e.message };
  }
}

export default PutProposal;
