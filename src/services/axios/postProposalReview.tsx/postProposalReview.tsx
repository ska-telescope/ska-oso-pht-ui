import axios from 'axios';
import {
  OSO_SERVICES_REVIEWS_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { helpers } from '@/utils/helpers';
import { ProposalReview, ProposalReviewBackend } from '@/utils/types/proposalReview';

export function mappingReviewFrontendToBackend(
  review: ProposalReview,
  cycleId: string,
  mocked = false
): ProposalReviewBackend {
  const transformedPanel: ProposalReviewBackend = {
    review_id: review.id,
    panel_id: review.panelId,
    cycle: review.cycle ? review.cycle : cycleId,
    submitted_on: mocked ? review.submittedOn : new Date().toISOString(),
    submitted_by: review.submittedBy,
    reviewer_id: review.reviewerId,
    prsl_id: review.prslId,
    review_type: {
      kind: review.reviewType.kind,
      excluded_from_decision: review.reviewType.excludedFromDecision,
      rank: review.reviewType.rank,
      conflict: {
        has_conflict: review.reviewType.conflict.hasConflict,
        reason: review.reviewType.conflict.reason
      }
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

async function PostProposalReview(
  review: ProposalReview,
  cycleId: string
): Promise<string | { error: string }> {
  if (USE_LOCAL_DATA) {
    return postMockProposalReview();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/`;
    const convertedReview = mappingReviewFrontendToBackend(review, cycleId);

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
