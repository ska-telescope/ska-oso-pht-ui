import { REVIEW_TYPE } from '@utils/constants.ts';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import { Metadata } from '@utils/types/metadata.tsx';
import { ProposalReview, ScienceReview, TechnicalReview } from '@utils/types/proposalReview.tsx';
import type {
  FeasibilityStatus,
  PanelReview,
  ReviewStatus,
  ReviewType,
  ScienceReview as ScienceReviewPDM,
  TechnicalReview as TechnicalReviewPDM
} from '@/generated/models';

/**
 * A review as the ODA stores it. The generated PanelReview leaves out the submission fields, which
 * the ODA still stores and returns with a review, so they are added here.
 */
export type ReviewPDM = PanelReview & {
  submitted_on?: string | null;
  submitted_by?: string | null;
};

const scienceReviewFromPdm = (pdm: ScienceReviewPDM): ScienceReview => ({
  kind: pdm.kind as string,
  // Older reviews were saved with 'True'/'False' strings rather than the PDM's boolean, so both
  // are read
  excludedFromDecision: String(pdm.excluded_from_decision).toLowerCase() === 'true',
  rank: pdm.rank as number,
  conflict: {
    hasConflict: pdm.conflict.has_conflict as boolean,
    reason: pdm.conflict.reason as string
  }
});

const technicalReviewFromPdm = (pdm: TechnicalReviewPDM): TechnicalReview => ({
  kind: pdm.kind as string,
  isFeasible: pdm.is_feasible as string
});

/** A review as the PMT holds it. */
export const reviewFromPdm = (pdm: ReviewPDM): ProposalReview => ({
  id: pdm.review_id as string,
  panelId: pdm.panel_id as string,
  cycle: pdm.cycle as string,
  submittedOn: pdm.submitted_on as string | null,
  submittedBy: pdm.submitted_by as string | null,
  reviewerId: pdm.reviewer_id,
  prslId: pdm.prsl_id,
  reviewType:
    pdm.review_type.kind === REVIEW_TYPE.SCIENCE
      ? scienceReviewFromPdm(pdm.review_type as ScienceReviewPDM)
      : technicalReviewFromPdm(pdm.review_type as TechnicalReviewPDM),
  comments: pdm.comments as string,
  srcNet: pdm.src_net as string,
  status: pdm.status as unknown as string,
  // The ODA fills in the metadata of all it stores, so the PDM's optional fields are present
  metadata: pdm.metadata as Metadata
});

/** The reviews, keeping only the latest version of each (the ODA can return several). */
export const reviewsFromPdm = (pdms: ReviewPDM[]): ProposalReview[] =>
  (pdms.length > 1 ? (getUniqueMostRecentItems(pdms, 'review_id') as ReviewPDM[]) : pdms).map(
    reviewFromPdm
  );

const scienceReviewToPdm = (review: ScienceReview): ReviewType =>
  ({
    kind: review.kind,
    excluded_from_decision: review.excludedFromDecision,
    rank: review.rank,
    conflict: {
      has_conflict: review.conflict.hasConflict,
      reason: review.conflict.reason
    }
  }) as ReviewType;

const technicalReviewToPdm = (review: TechnicalReview): ReviewType =>
  ({
    kind: review.kind,
    is_feasible: review.isFeasible as FeasibilityStatus
  }) as ReviewType;

/**
 * The PDM to save the review as, in its own cycle or else the given one. Its metadata is left out,
 * as the ODA keeps that itself.
 */
export const reviewToPdm = (review: ProposalReview, cycleId: string = review.cycle): ReviewPDM => ({
  review_id: review.id,
  panel_id: review.panelId,
  cycle: review.cycle ? review.cycle : cycleId,
  submitted_on: review.submittedOn,
  submitted_by: review.submittedBy,
  reviewer_id: review.reviewerId,
  prsl_id: review.prslId,
  review_type:
    review.reviewType.kind === REVIEW_TYPE.SCIENCE
      ? scienceReviewToPdm(review.reviewType as ScienceReview)
      : technicalReviewToPdm(review.reviewType as TechnicalReview),
  comments: review.comments,
  src_net: review.srcNet,
  status: review.status as unknown as ReviewStatus
});
