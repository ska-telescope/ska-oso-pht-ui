import axios from 'axios';
import {
  AXIOS_CONFIG,
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
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
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/${proposal.id}`;
    // TODO: add testing for proposal conversion format
    const convertedProposal = MappingPutProposal(proposal, status);
    const result = await axios.put(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? { error: 'error.API_UNKNOWN_ERROR' } : { valid: result };
  } catch (e) {
    return { error: e.message };
  }
}

export default PutProposal;
