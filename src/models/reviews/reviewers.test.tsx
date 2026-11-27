import { describe, expect, test } from 'vitest';
import { combineReviewers, getReviewersAlphabetical } from './reviewers';
import { MockReviewersBackendList } from './testing/mockReviewerList';

const [sofia, liam] = MockReviewersBackendList.sci_reviewers;

describe('combineReviewers', () => {
  test('flags each reviewer with the lists they are in, once each', () => {
    const result = combineReviewers([sofia, liam], [liam]);
    expect(result).toEqual([
      { ...sofia, isScience: true, isTechnical: false },
      { ...liam, isScience: true, isTechnical: true }
    ]);
  });

  test('adds a technical-only reviewer', () => {
    expect(combineReviewers([], [liam])).toEqual([
      { ...liam, isScience: false, isTechnical: true }
    ]);
  });
});

describe('getReviewersAlphabetical', () => {
  test('sorts by display name', () => {
    const result = getReviewersAlphabetical(combineReviewers([sofia, liam], []));
    expect(result.map((r) => r.displayName)).toEqual([liam.displayName, sofia.displayName]);
  });
});
