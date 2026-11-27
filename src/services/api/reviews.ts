import { ProposalReview } from '@utils/types/proposalReview.tsx';
import {
  type ReviewPDM,
  reviewFromPdm,
  reviewsFromPdm,
  reviewToPdm
} from '@/models/reviews/reviews';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

/** The reviews assigned to the user, the latest version of each. */
export const listMyReviews = (): Promise<ApiResult<ProposalReview[]>> =>
  callApi(
    () => api.reviews.getReviewsForUserOsoApiV17PhtReviewsUsersReviewsGet(),
    (data) => {
      // A list response that isn't a list is malformed, so it is an error rather than no reviews
      if (!Array.isArray(data)) {
        throw new Error(UNKNOWN_API_ERROR);
      }
      return reviewsFromPdm(data as ReviewPDM[]);
    }
  );

/**
 * Creates the review in its own cycle or else the given one, returning the new review's ID. A
 * review created already submitted is stamped as submitted now.
 */
export const createReview = (review: ProposalReview, cycleId: string): Promise<ApiResult<string>> =>
  callApi(() =>
    api.reviews.createReviewOsoApiV17PhtReviewsCreatePost(
      reviewToPdm(
        { ...review, submittedOn: review.submittedBy ? new Date().toISOString() : null },
        cycleId
      )
    )
  );

/** Saves the review as it is, submission date included, returning the review as stored. */
export const updateReview = (review: ProposalReview): Promise<ApiResult<ProposalReview>> =>
  callApi(
    () => api.reviews.updateReviewOsoApiV17PhtReviewsReviewIdPut(review.id, reviewToPdm(review)),
    (data) => reviewFromPdm(data as ReviewPDM)
  );
