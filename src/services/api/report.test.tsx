import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  mockReviewDashboardBackend,
  mockReviewDashboardFrontend
} from '@/models/reviews/testing/mockReviewDashboard';
import { UNKNOWN_API_ERROR } from './apiResult';
import { getReviewDashboard } from './report';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: { report: { getReportOsoApiV17PhtReportGet: mockGet } }
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getReviewDashboard', () => {
  test('returns the mapped report', async () => {
    mockGet.mockResolvedValue({ data: mockReviewDashboardBackend });
    await expect(getReviewDashboard()).resolves.toEqual({ data: mockReviewDashboardFrontend });
  });

  test('returns the standard error when the response is not a list', async () => {
    mockGet.mockResolvedValue({ data: { not: 'a list' } });
    await expect(getReviewDashboard()).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });
});
