import axios from 'axios';
import {
  OSO_SERVICES_REVIEWS_PATH,
  REVIEW_TYPE,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { helpers } from '@/utils/helpers';
import {
  ProposalReview,
  ProposalReviewBackend,
  ScienceReview,
  ScienceReviewBackend,
  TechnicalReview,
  TechnicalReviewBackend
} from '@/utils/types/proposalReview';

function getTechnicalReviewType(technicalReview: TechnicalReview): TechnicalReviewBackend {
  return {
    kind: technicalReview.kind,
    feasibility: {
      is_feasible: technicalReview.feasibility.isFeasible,
      comments: technicalReview.feasibility.comments
    }
  };
}

function getScienceReviewType(scienceReview: ScienceReview): ScienceReviewBackend {
  return {
    kind: scienceReview.kind,
    excluded_from_decision: scienceReview.excludedFromDecision,
    rank: scienceReview.rank,
    conflict: {
      has_conflict: scienceReview.conflict.hasConflict,
      reason: scienceReview.conflict.reason
    }
  };
}

function getSubmittedOnDate(review: ProposalReview, mocked: boolean): string | null {
  if (mocked) {
    return review.submittedOn;
  }
  if (review.submittedBy) {
    return new Date().toISOString();
  }
  return null;
}

export function mappingReviewFrontendToBackend(
  review: ProposalReview,
  cycleId: string,
  mocked = false
): ProposalReviewBackend {
  const transformedPanel: ProposalReviewBackend = {
    review_id: review.id,
    panel_id: review.panelId,
    cycle: review.cycle ? review.cycle : cycleId,
    submitted_on: getSubmittedOnDate(review, mocked),
    submitted_by: review.submittedBy,
    reviewer_id: review.reviewerId,
    prsl_id: review.prslId,
    review_type:
      review.reviewType.kind === REVIEW_TYPE.SCIENCE
        ? getScienceReviewType(review.reviewType as ScienceReview)
        : getTechnicalReviewType(review.reviewType as TechnicalReview),
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
