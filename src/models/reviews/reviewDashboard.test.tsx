import { describe, expect, test } from 'vitest';
import { reviewDashboardFromPdm } from './reviewDashboard';
import {
  mockReviewDashboardBackend,
  mockReviewDashboardFrontend
} from './testing/mockReviewDashboard';

describe('reviewDashboardFromPdm', () => {
  test('maps the report rows', () => {
    expect(reviewDashboardFromPdm(mockReviewDashboardBackend)).toEqual(mockReviewDashboardFrontend);
  });

  test('maps no rows to none', () => {
    expect(reviewDashboardFromPdm([])).toEqual([]);
  });
});
