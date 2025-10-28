import {
  OSO_SERVICES_REPORT_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import { ReviewDashboard, ReviewDashboardBackend } from '@utils/types/reviewDashboard.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import { mockReviewDashboardBackend } from './mockReviewDashboard.tsx';

export function getMockReviewDashboard(): ReviewDashboard[] {
  return mappingReviewDashboardBackendToFrontend(mockReviewDashboardBackend);
}

export function mappingReviewDashboardBackendToFrontend(
  reviewDashboardBackend: ReviewDashboardBackend[]
): ReviewDashboard[] {
  const transformedReviewDashboard = (
    reviewDashboardBackend: ReviewDashboardBackend
  ): ReviewDashboard => {
    const reviewDashboard: ReviewDashboard = {
      prslId: reviewDashboardBackend.prsl_id,
      title: reviewDashboardBackend.title,
      scienceCategory: reviewDashboardBackend.science_category || undefined,
      proposalStatus: reviewDashboardBackend.proposal_status,
      proposalType: reviewDashboardBackend.proposal_type,
      cycle: reviewDashboardBackend.cycle,
      proposalAttributes: reviewDashboardBackend.proposal_attributes,
      array: reviewDashboardBackend.array,
      panelId: reviewDashboardBackend.panel_id || undefined,
      panelName: reviewDashboardBackend.panel_name || undefined,
      reviewerId: reviewDashboardBackend.reviewer_id || undefined,
      reviewerStatus: reviewDashboardBackend.review_status || undefined,
      reviewStatus: reviewDashboardBackend.review_status || undefined,
      conflict: reviewDashboardBackend.conflict,
      reviewId: reviewDashboardBackend.review_id || undefined,
      reviewRank: reviewDashboardBackend.review_rank || undefined,
      comments: reviewDashboardBackend.comments || undefined,
      decisionId: reviewDashboardBackend.decision_id || undefined,
      assignedProposal: reviewDashboardBackend.assigned_proposal || undefined,
      recommendation: reviewDashboardBackend.recommendation || undefined,
      decisionStatus: reviewDashboardBackend.decision_status || undefined,
      panelRank: reviewDashboardBackend.panel_rank || undefined,
      panelScore: reviewDashboardBackend.panel_score || undefined,
      reviewSubmittedOn: reviewDashboardBackend.review_submitted_on || undefined,
      decisionOn: reviewDashboardBackend.decision_on || undefined,
      location: reviewDashboardBackend.location || undefined
    };
    return reviewDashboard;
  };

  return reviewDashboardBackend.map(item => transformedReviewDashboard(item));
}

async function getReviewDashboard(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>
): Promise<ReviewDashboard[] | { error: string }> {
  if (USE_LOCAL_DATA) {
    return getMockReviewDashboard();
  }

  try {
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${OSO_SERVICES_REPORT_PATH}`);

    if (!result || !Array.isArray(result.data)) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return mappingReviewDashboardBackendToFrontend(result.data) as ReviewDashboard[];
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default getReviewDashboard;
