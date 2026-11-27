import { beforeEach, describe, expect, test, vi } from 'vitest';
import { reviewToPdm } from '@/models/reviews/reviews';
import { MockProposalScienceReviewFrontend } from '@/models/reviews/testing/mockProposalReview';
import { MockProposalScienceReviewPdm } from '@/models/reviews/testing/mockProposalReviewPdm';
import { MockProposalReviewList } from '@/models/reviews/testing/mockProposalReviewList';
import { MockProposalReviewListPdm } from '@/models/reviews/testing/mockProposalReviewListPdm';
import { UNKNOWN_API_ERROR } from './apiResult';
import { createReview, listMyReviews, updateReview } from './reviews';

// The error handling common to every call is tested with callApi (apiResult.test.tsx)

const { mockList, mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn()
}));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: {
    reviews: {
      getReviewsForUserOsoApiV17PhtReviewsUsersReviewsGet: mockList,
      createReviewOsoApiV17PhtReviewsCreatePost: mockCreate,
      updateReviewOsoApiV17PhtReviewsReviewIdPut: mockUpdate
    }
  }
}));

const review = MockProposalScienceReviewFrontend;

beforeEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

describe('listMyReviews', () => {
  test('returns the latest version of each review', async () => {
    mockList.mockResolvedValue({ data: MockProposalReviewListPdm });
    await expect(listMyReviews()).resolves.toEqual({ data: MockProposalReviewList });
  });

  test('returns the standard error when the response is not a list', async () => {
    mockList.mockResolvedValue({ data: { not: 'a list' } });
    await expect(listMyReviews()).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });
});

describe('createReview', () => {
  test('stamps a submitted review as submitted now and returns the new ID', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    mockCreate.mockResolvedValue({ data: 'review-1' });

    await expect(createReview(review, 'cycle-2')).resolves.toEqual({ data: 'review-1' });

    expect(mockCreate).toHaveBeenCalledExactlyOnceWith({
      ...reviewToPdm(review),
      submitted_on: new Date().toISOString()
    });
  });

  test('leaves an unsubmitted review without a submission date, in the given cycle', async () => {
    mockCreate.mockResolvedValue({ data: 'review-1' });

    await createReview({ ...review, cycle: '', submittedBy: null }, 'cycle-2');

    expect(mockCreate.mock.calls[0][0]).toMatchObject({
      cycle: 'cycle-2',
      submitted_on: null,
      submitted_by: null
    });
  });
});

describe('updateReview', () => {
  test('saves the review as it is and returns it as stored', async () => {
    mockUpdate.mockResolvedValue({ data: MockProposalScienceReviewPdm });

    await expect(updateReview(review)).resolves.toEqual({ data: review });

    expect(mockUpdate).toHaveBeenCalledExactlyOnceWith(review.id, MockProposalScienceReviewPdm);
  });

  test('returns the error from a failed save', async () => {
    mockUpdate.mockRejectedValue(new Error('Network Error'));
    await expect(updateReview(review)).resolves.toEqual({ error: 'Network Error' });
  });
});
