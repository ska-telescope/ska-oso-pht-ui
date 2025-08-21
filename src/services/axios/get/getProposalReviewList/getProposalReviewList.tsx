import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_REVIEWS_PATH
} from '@utils/constants.ts';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import { ProposalReview, ProposalReviewBackend } from '@utils/types/proposalReview.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import { mappingReviewBackendToFrontend } from '../put/putProposalReview/putProposalReview';
import { MockProposalReviewListBackend } from './mockProposalReviewListBackend.tsx';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mappingList(inRec: ProposalReviewBackend[]): ProposalReview[] {
  const output = inRec.map(item => mappingReviewBackendToFrontend(item));
  return output;
}

/*****************************************************************************************************************************/

export function GetMockProposalReviewList(mock = MockProposalReviewListBackend): ProposalReview[] {
  // this removes duplicates versions from the backend list and sorts by last modified date
  const uniqueResults = mock.length > 1 ? getUniqueMostRecentItems(mock, 'review_id') : mock;
  return mappingList(uniqueResults);
}

async function GetProposalReviewList(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  userId: string
): Promise<ProposalReview[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposalReviewList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/list/${userId}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);
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
