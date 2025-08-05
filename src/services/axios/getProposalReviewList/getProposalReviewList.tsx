import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_REVIEWS_PATH, OSO_SERVICES_PROPOSAL_PATH
} from '../../../utils/constants';
import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { mappingReviewBackendToFrontend } from '../putProposalReview/putProposalReview';
import { MockProposalReviewListBackend } from './mockProposalReviewListBackend';
import { getUniqueMostRecentItems } from '@/utils/helpers';
import { ProposalReview, ProposalReviewBackend } from '@/utils/types/proposalReview';
import Proposal from '@utils/types/proposal.tsx';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mappingList(inRec: ProposalReviewBackend[]): ProposalReview[] {
  const output = inRec.map(item => mappingReviewBackendToFrontend(item));
  return output;
}

/*****************************************************************************************************************************/

export function GetMockProposalReviewList(mock = MockProposalReviewListBackend): ProposalReview[] {
  const uniqueResults = mock.length > 1 ? getUniqueMostRecentItems(mock, 'review_id') : mock;
  return mappingList(uniqueResults);
}

async function GetProposalReviewList(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  proposal: Proposal
): Promise<ProposalReview[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposalReviewList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/reviews/${proposal.id}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);
    console.log('check result ', result);
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
