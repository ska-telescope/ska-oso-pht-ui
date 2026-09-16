import { SKA_OSO_SERVICES_URL, OSO_SERVICES_REVIEWS_PATH } from '@utils/constants.ts';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import { ProposalReview, ProposalReviewBackend } from '@utils/types/proposalReview.tsx';
import { mappingReviewBackendToFrontend } from '@services/axios/put/putProposalReview/putProposalReview.tsx';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.tsx';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mappingList(inRec: ProposalReviewBackend[]): ProposalReview[] {
  const output = inRec.map((item) => mappingReviewBackendToFrontend(item));
  return output;
}

/*****************************************************************************************************************************/

async function GetProposalReviewList(
  authAxiosClient: AxiosAuthClient
): Promise<ProposalReview[] | string> {
  try {
    const URL_PATH = `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_REVIEWS_PATH}/users/reviews`;
    const result = await authAxiosClient.get(`${URL_PATH}`);
    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }
    const uniqueResults =
      result.data?.length > 1 ? getUniqueMostRecentItems(result.data, 'review_id') : result.data;
    return mappingList(uniqueResults);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposalReviewList;
