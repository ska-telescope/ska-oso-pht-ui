import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_REVIEWS_PATH
} from '../../../utils/constants';
import axiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import ProposalReview from '@/utils/types/proposalReview';

/*****************************************************************************************************************************/

// NOTE : Make sure that prsl_id is set to an active proposal

export function GetMockReviewerList(): ProposalReview[] {
  return [
    {
      metadata: {
        version: 1,
        created_by: 'created_by',
        created_on: '2025-07-07T18:13:25.470Z',
        last_modified_by: 'last_modified_by',
        last_modified_on: '2025-07-07T18:13:25.470Z',
        pdm_version: '18.3.0'
      },
      panel_id: 'panel_id',
      review_id: 'review_id',
      cycle: 'cycle',
      reviewer_id: 'reviewer_id',
      prsl_id: 'prsl-t0001-20250707-00002',
      rank: 0,
      conflict: {
        has_conflict: false,
        reason: ''
      },
      comments: '',
      src_net: '',
      submitted_on: '',
      submitted_by: '',
      status: 'to do'
    }
  ];
}

// TODO : Remove the true
async function GetProposalReviewList(): Promise<ProposalReview[] | string> {
  if (true || USE_LOCAL_DATA) {
    return GetMockReviewerList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/list`;
    const result = await axiosAuthClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }
    return result?.data;
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposalReviewList;
