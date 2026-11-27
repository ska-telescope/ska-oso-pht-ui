import { ReviewDashboard, ReviewDashboardBackend } from '@utils/types/reviewDashboard.tsx';
import { reviewDashboardFromPdm } from '@/models/reviews/reviewDashboard';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

/** The review dashboard report, one row per proposal, panel and reviewer. */
export const getReviewDashboard = (): Promise<ApiResult<ReviewDashboard[]>> =>
  callApi(
    () => api.report.getReportOsoApiV17PhtReportGet(),
    (data) => {
      if (!Array.isArray(data)) {
        throw new Error(UNKNOWN_API_ERROR);
      }
      // The generated report type gives most fields as empty placeholder types, so the rows are
      // read with the app's own description of them
      return reviewDashboardFromPdm(data as unknown as ReviewDashboardBackend[]);
    }
  );
