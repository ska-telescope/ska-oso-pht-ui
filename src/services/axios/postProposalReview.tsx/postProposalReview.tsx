import axios from 'axios';
import {
  OSO_SERVICES_REVIEWS_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { helpers } from '@/utils/helpers';
import { ProposalReview, ProposalReviewBackend } from '@/utils/types/proposalReview';
import { fetchCycleData } from '@/utils/storage/cycleData';

export function mappingPostProposalReview(review: ProposalReview): ProposalReviewBackend {
  const transformedPanel: ProposalReviewBackend = {
    review_id: review.id,
    panel_id: review.panelId,
    cycle: fetchCycleData().id,
    submitted_on: review.submittedOn,
    submitted_by: review.submittedBy,
    reviewer_id: review.reviewerId,
    prsl_id: review.prslId,
    rank: review.rank,
    conflict: {
      has_conflict: review.conflict.hasConflict,
      reason: review.conflict.reason
    },
    comments: review.comments,
    src_net: review.srcNet,
    status: review.status,
    metadata: review.metadata
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedPanel);
  return transformedPanel;
}

export function postMockProposalReview(): string {
  return 'PROPOSAL-REVIEW-ID-001';
}

async function PostProposalReview(review: ProposalReview): Promise<string | { error: string }> {
  if (USE_LOCAL_DATA) {
    return postMockProposalReview();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/`;
    const convertedReview = mappingPostProposalReview(review);

    const result = await axios.post(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, convertedReview);

    if (!result) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return result.data as string;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostProposalReview;
