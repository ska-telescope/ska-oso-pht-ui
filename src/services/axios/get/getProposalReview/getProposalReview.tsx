import { SKA_OSO_SERVICES_URL, OSO_SERVICES_REVIEWS_PATH } from '@utils/constants.ts';
import { ProposalReview } from '@utils/types/proposalReview.tsx';
import { mappingReviewBackendToFrontend } from '@services/axios/put/putProposalReview/putProposalReview.tsx';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.tsx';

async function GetProposalReview(
  authAxiosClient: AxiosAuthClient,
  id: string
): Promise<ProposalReview | string> {
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
