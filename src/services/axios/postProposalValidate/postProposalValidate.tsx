import MappingPutProposal from '../putProposal/putProposalMapping';
import axiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import {
  OSO_SERVICES_PROPOSAL_PATH,
  PROPOSAL_STATUS,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@/utils/constants.ts';
import Proposal from '@/utils/types/proposal';

interface ValidateResponseData {
  result: Boolean;
  validation_errors: string[];
}

interface ValidateServiceResponse {
  error?: string[];
  valid?: string;
}

async function PostProposalValidate(proposal: Proposal): Promise<ValidateServiceResponse> {
  if (USE_LOCAL_DATA) {
    return { valid: 'success' };
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/validate`;
    const convertedProposal = MappingPutProposal(proposal, PROPOSAL_STATUS.DRAFT);
    const result = await axiosAuthClient.post(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}`,
      convertedProposal
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
    if (e instanceof Error) {
      return { error: [e.message] };
    } else {
      const error = e as { response: { data: { title: string } } };
      return { error: [error?.response?.data?.title] };
    }
  }
}

export default PostProposalValidate;
