import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';
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
    console.log('::: in putProposal - proposal', proposal);
    const convertedProposal = MappingPutProposal(proposal, status);
    const result = await axios.put(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? { error: 'error.API_UNKNOWN_ERROR' } : { valid: result };
  } catch (e) {
    return { error: e.message };
  }
}

export default PutProposal;
