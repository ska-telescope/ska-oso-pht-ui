import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping.tsx';
import {
  OSO_SERVICES_PROPOSAL_PATH,
  PROPOSAL_STATUS,
  SKA_OSO_SERVICES_URL
} from '@utils/constants.ts';
import Proposal from '@utils/types/proposal.tsx';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.tsx';

export interface ValidateResponseData {
  result: boolean;
  validation_errors: string[];
}

export interface ValidateServiceResponse {
  error?: string[];
  valid?: string;
}

async function PostProposalValidate(
  authAxiosClient: AxiosAuthClient,
  proposal: Proposal
): Promise<ValidateServiceResponse> {
  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/validate`;
    const convertedProposal = MappingPutProposal(proposal, PROPOSAL_STATUS.DRAFT);
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
