import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping.tsx';
import {
  OSO_SERVICES_PROPOSAL_PATH,
  PROPOSAL_STATUS,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import Proposal from '@utils/types/proposal.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';

export interface ValidateResponseData {
  result: Boolean;
  validation_errors: string[];
}

export interface ValidateServiceResponse {
  error?: string[];
  valid?: string;
}

export function postMockProposalValidate(): { valid: string } {
  return { valid: 'success' };
}

async function PostProposalValidate(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  proposal: Proposal
): Promise<ValidateServiceResponse> {
  if (USE_LOCAL_DATA) {
    return postMockProposalValidate();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/validate`;
    const convertedProposal = MappingPutProposal(proposal, false, PROPOSAL_STATUS.DRAFT);
    const result = await authAxiosClient.post(
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
