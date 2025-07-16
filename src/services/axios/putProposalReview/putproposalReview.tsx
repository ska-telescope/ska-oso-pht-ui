import axios from 'axios';
import { OSO_SERVICES_REVIEWS_PATH, SKA_OSO_SERVICES_URL, USE_LOCAL_DATA } from '@utils/constants';
import { mappingPostProposalReview } from '../postProposalReview.tsx/postProposalReview';
import { MockProposalReviewFrontend } from '../postProposalReview.tsx/mockProposalReviewFrontend';
import { helpers } from '@/utils/helpers';
import { ProposalReview, ProposalReviewBackend } from '@/utils/types/proposalReview';

// mapping from backend to frontend for review returned in response
export function mappingPutProposalReview(review: ProposalReviewBackend): ProposalReview {
  const transformedPanel: ProposalReview = {
    id: review.review_id,
    panelId: review.panel_id,
    cycle: review.cycle,
    submittedOn: review.submitted_on,
    submittedBy: review.submitted_by,
    reviewerId: review.reviewer_id,
    prslId: review.prsl_id,
    rank: review.rank,
    conflict: {
      hasConflict: review.conflict.has_conflict,
      reason: review.conflict.reason
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

export function putMockProposalReview(): ProposalReviewBackend {
  return mappingPostProposalReview(MockProposalReviewFrontend);
}

async function PutProposalReview(
  review: ProposalReview
): Promise<ProposalReview | { error: string }> {
  if (USE_LOCAL_DATA) {
    return MockProposalReviewFrontend; // TODO add mapping from backend to frontend
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/${review.id}`;
    const convertedReview = mappingPostProposalReview(review);

    const result = await axios.put(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, convertedReview);

    if (!result) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return result.data as ProposalReview; // TODO add mapping from backend to frontend
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutProposalReview;
