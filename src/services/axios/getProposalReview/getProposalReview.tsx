import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_REVIEWS_PATH
} from '../../../utils/constants';
import axiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { MockProposalReviewBackend } from '../postProposalReview.tsx/mockProposalReviewBackend';
import { mappingReviewBackendToFrontend } from '../putProposalReview/putProposalReview';
import { ProposalReview, ProposalReviewBackend } from '@/utils/types/proposalReview';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

/*
export function mapping(inRec: ProposalReviewBackend): ProposalReview {
    const rec: ProposalReview = {
      id: inRec.review_id?.toString(),
      metadata: inRec.metadata, // TODO create metadata backend type and mapping + modify frontend type to be camelCase
      panelId: inRec.panel_id,
      cycle: inRec.cycle,
      reviewerId: inRec.reviewer_id,
      prslId: inRec.prsl_id,
      rank: inRec.rank,
      conflict: {
        hasConflict: inRec.conflict.has_conflict,
        reason: inRec.conflict.reason
      },
      comments: inRec.comments,
      srcNet: inRec.src_net,
      submittedOn: inRec.submitted_on,
      submittedBy: inRec.submitted_by,
      status: inRec.status
    };
    return rec;
}
    */

/*****************************************************************************************************************************/

// NOTE : Make sure that prsl_id is set to an active proposal

export function GetMockReview(
  mock: ProposalReviewBackend = MockProposalReviewBackend
): ProposalReview {
  return mappingReviewBackendToFrontend(mock);
}

async function GetProposalReview(id: string): Promise<ProposalReview | string> {
  if (USE_LOCAL_DATA) {
    return GetMockReview();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/${id}`;
    const result = await axiosAuthClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !result.data) {
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

export default GetProposalReview;
