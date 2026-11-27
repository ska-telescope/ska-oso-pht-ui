import { ReviewDashboard, ReviewDashboardBackend } from '@utils/types/reviewDashboard.tsx';

/** The rows of the review dashboard report, as the PMT holds them. */
export function reviewDashboardFromPdm(
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
      decisionOn: reviewDashboardBackend.decision_on || undefined
    };
    return reviewDashboard;
  };

  return reviewDashboardBackend.map((item) => transformedReviewDashboard(item));
}
