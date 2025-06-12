import axios from 'axios';
import {
  AXIOS_CONFIG,
  OSO_SERVICES_PROPOSAL_PATH,
  PROPOSAL_STATUS,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import MappingPutProposal from '../putProposal/putProposalMapping';

interface ValidateResponseData {
  result: Boolean;
  validation_errors: string[];
}

interface ValidateServiceResponse {
  error?: string[];
  valid?: string;
}

async function PostProposalValidate(proposal): Promise<ValidateServiceResponse> {
  if (USE_LOCAL_DATA) {
    return { valid: 'success' };
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/validate`;
    const convertedProposal = MappingPutProposal(proposal, PROPOSAL_STATUS.DRAFT);
    const result = await axios.post(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );

    const validateResponseData: ValidateResponseData = result.data;
    if (typeof validateResponseData === 'undefined') {
      return { error: ['error.API_UNKNOWN_ERROR'] };
    } else if (validateResponseData.result === false) {
      return { error: validateResponseData.validation_errors };
    } else {
      return { valid: 'success' };
    }
  } catch (e) {
    const errorMessage = `${e?.message}: ${e?.response?.data?.title}`;
    return { error: [errorMessage] };
  }
}

export default PostProposalValidate;
