import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MockReviewersBackendList } from '@/models/reviews/testing/mockReviewerList';
import { UNKNOWN_API_ERROR } from './apiResult';
import { listReviewers } from './reviewers';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: { reviewers: { getReviewersOsoApiV17PhtReviewersGet: mockGet } }
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('listReviewers', () => {
  test('returns the science and technical reviewers as one list sorted by name', async () => {
    mockGet.mockResolvedValue({ data: MockReviewersBackendList });

    const { data } = await listReviewers();

    const names = data?.map((r) => r.displayName) ?? [];
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(data?.every((r) => r.isScience || r.isTechnical)).toBe(true);
  });

  test('returns no reviewers when both lists are empty', async () => {
    mockGet.mockResolvedValue({ data: { sci_reviewers: [], tech_reviewers: [] } });
    await expect(listReviewers()).resolves.toEqual({ data: [] });
  });

  test('returns the standard error when either list is missing', async () => {
    mockGet.mockResolvedValue({ data: { sci_reviewers: [] } });
    await expect(listReviewers()).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });
});
