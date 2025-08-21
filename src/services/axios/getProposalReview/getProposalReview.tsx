import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_REVIEWS_PATH
} from '@utils/constants.ts';
import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { MockProposalScienceReviewBackend } from '../post/postProposalReview/mockProposalReviewBackend';
import { mappingReviewBackendToFrontend } from '../put/putProposalReview/putProposalReview';
import { ProposalReview, ProposalReviewBackend } from '@/utils/types/proposalReview';

export function GetMockReview(
  mock: ProposalReviewBackend = MockProposalScienceReviewBackend
): ProposalReview {
  return mappingReviewBackendToFrontend(mock);
}

async function GetProposalReview(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  id: string
): Promise<ProposalReview | string> {
  if (USE_LOCAL_DATA) {
    return GetMockReview();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/${id}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !result.data) {
      return 'error.API_UNKNOWN_ERROR';
    }
    return mappingReviewBackendToFrontend(result?.data);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposalReview;
