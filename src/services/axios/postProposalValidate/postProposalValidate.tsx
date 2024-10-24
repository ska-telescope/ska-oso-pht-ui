import axios from 'axios';
import {
  AXIOS_CONFIG,
  PROPOSAL_STATUS,
  SKA_PHT_API_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import MappingPutProposal from '../putProposal/putProposalMapping';

interface ValidateResponseData {
  result: Boolean;
  validation_errors: string[];
}

interface ValidateServiceResponse {
  error?: string;
  valid?: string;
}

async function PostProposalValidate(proposal): Promise<ValidateServiceResponse> {
  if (USE_LOCAL_DATA) {
    return { valid: 'success' };
  }

  try {
    const URL_PATH = `/proposals/validate`;
    const convertedProposal = MappingPutProposal(proposal, PROPOSAL_STATUS.DRAFT);
    const result = await axios.post(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );

    const validateResponseData: ValidateResponseData = result.data;
    if (typeof validateResponseData === 'undefined') {
      return { error: 'error.API_UNKNOWN_ERROR' };
    } else if (validateResponseData.result === false) {
      return { error: validateResponseData.validation_errors[0] };
    } else {
      return { valid: 'success' };
    }
  } catch (e) {
    const errorMessage = `${e?.message}: ${e?.response?.data?.title}`;
    return { error: errorMessage };
  }
}

export default PostProposalValidate;
