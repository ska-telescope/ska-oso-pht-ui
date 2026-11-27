import { Reviewer, ReviewerBackend } from '@utils/types/reviewer.tsx';
import { combineReviewers, getReviewersAlphabetical } from '@/models/reviews/reviewers';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

// The generated client types the reviewers response as any object, so its shape is given here
interface ReviewersResponseData {
  sci_reviewers: ReviewerBackend[];
  tech_reviewers: ReviewerBackend[];
}

/** The science and technical reviewers, as one list sorted by name. */
export const listReviewers = (): Promise<ApiResult<Reviewer[]>> =>
  callApi(
    () => api.reviewers.getReviewersOsoApiV17PhtReviewersGet(),
    (data) => {
      const response = data as unknown as ReviewersResponseData;
      if (!Array.isArray(response.sci_reviewers) || !Array.isArray(response.tech_reviewers)) {
        throw new Error(UNKNOWN_API_ERROR);
      }
      return getReviewersAlphabetical(
        combineReviewers(response.sci_reviewers, response.tech_reviewers)
      );
    }
  );
