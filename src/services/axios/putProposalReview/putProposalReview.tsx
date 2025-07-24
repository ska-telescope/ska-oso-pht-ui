import axios from 'axios';
import { OSO_SERVICES_REVIEWS_PATH, SKA_OSO_SERVICES_URL, USE_LOCAL_DATA } from '@utils/constants';
import { mappingReviewFrontendToBackend } from '../postProposalReview.tsx/postProposalReview';
import { MockProposalReviewBackend } from '../postProposalReview.tsx/mockProposalReviewBackend';
import { helpers } from '@/utils/helpers';
import { ProposalReview, ProposalReviewBackend } from '@/utils/types/proposalReview';

// mapping from backend to frontend for review returned in response
export function mappingReviewBackendToFrontend(review: ProposalReviewBackend): ProposalReview {
  const transformedPanel: ProposalReview = {
    id: review.review_id,
    panelId: review.panel_id,
    cycle: review.cycle,
    submittedOn: review.submitted_on,
    submittedBy: review.submitted_by,
    reviewerId: review.reviewer_id,
    prslId: review.prsl_id,
    reviewType: {
      kind: review.review_type.kind,
      rank: review.review_type.rank,
      conflict: {
        hasConflict: review.review_type.conflict.has_conflict,
        reason: review.review_type.conflict.reason
      },
      excludedFromDecision: review.review_type.excluded_from_decision
    },
    comments: review.comments,
    srcNet: review.src_net,
    status: review.status,
    metadata: review.metadata
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedPanel);
  return transformedPanel;
}

export function putMockProposalReview(): ProposalReview {
  return mappingReviewBackendToFrontend(MockProposalReviewBackend);
}

async function PutProposalReview(
  review: ProposalReview
): Promise<ProposalReview | { error: string }> {
  if (USE_LOCAL_DATA) {
    return putMockProposalReview();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/${review.id}`;
    const convertedReview = mappingReviewFrontendToBackend(review, review.cycle, true);

    const result = await axios.put(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, convertedReview);

    if (!result) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return mappingReviewBackendToFrontend(result.data) as ProposalReview;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutProposalReview;
