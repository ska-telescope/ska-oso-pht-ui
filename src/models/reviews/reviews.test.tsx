import { describe, expect, test } from 'vitest';
import { REVIEW_TYPE } from '@utils/constants.ts';
import type { ScienceReview } from '@utils/types/proposalReview.tsx';
import { reviewFromPdm, reviewsFromPdm, reviewToPdm, type ReviewPDM } from './reviews';
import {
  MockProposalScienceReviewFrontend,
  MockProposalTechnicalReviewFrontend
} from './testing/mockProposalReview';
import {
  MockProposalScienceReviewPdm,
  MockProposalTechnicalReviewPdm
} from './testing/mockProposalReviewPdm';
import { MockProposalReviewList } from './testing/mockProposalReviewList';
import { MockProposalReviewListPdm } from './testing/mockProposalReviewListPdm';

describe('reviewFromPdm', () => {
  test.each([
    ['science', MockProposalScienceReviewPdm, MockProposalScienceReviewFrontend],
    ['technical', MockProposalTechnicalReviewPdm, MockProposalTechnicalReviewFrontend]
  ])('maps a %s review', (_kind, pdm, review) => {
    expect(reviewFromPdm(pdm)).toEqual(review);
  });

  test.each([true, 'True', 'true'])(
    'reads an exclusion from the decision saved as %j',
    (excluded) => {
      const pdm = {
        ...MockProposalScienceReviewPdm,
        review_type: {
          ...MockProposalScienceReviewPdm.review_type,
          excluded_from_decision: excluded
        }
      } as ReviewPDM;
      expect((reviewFromPdm(pdm).reviewType as ScienceReview).excludedFromDecision).toBe(true);
    }
  );

  test.each([false, 'False', undefined])(
    'reads %j as not excluded from the decision',
    (excluded) => {
      const pdm = {
        ...MockProposalScienceReviewPdm,
        review_type: {
          ...MockProposalScienceReviewPdm.review_type,
          excluded_from_decision: excluded
        }
      } as ReviewPDM;
      expect((reviewFromPdm(pdm).reviewType as ScienceReview).excludedFromDecision).toBe(false);
    }
  );
});

describe('reviewsFromPdm', () => {
  test('keeps only the latest version of each review', () => {
    expect(reviewsFromPdm(MockProposalReviewListPdm)).toEqual(MockProposalReviewList);
  });

  test('maps a single review as it is', () => {
    expect(reviewsFromPdm([MockProposalReviewListPdm[0]])).toEqual([MockProposalReviewList[0]]);
  });
});

describe('reviewToPdm', () => {
  test.each([
    ['science', MockProposalScienceReviewFrontend, MockProposalScienceReviewPdm],
    ['technical', MockProposalTechnicalReviewFrontend, MockProposalTechnicalReviewPdm]
  ])('maps a %s review, leaving out its metadata', (_kind, review, pdm) => {
    expect(reviewToPdm(review)).toEqual(pdm);
  });

  test('sends the exclusion from the decision as the PDM boolean', () => {
    const review = {
      ...MockProposalScienceReviewFrontend,
      reviewType: {
        ...(MockProposalScienceReviewFrontend.reviewType as ScienceReview),
        excludedFromDecision: true
      }
    };
    expect(reviewToPdm(review).review_type).toMatchObject({
      kind: REVIEW_TYPE.SCIENCE,
      excluded_from_decision: true
    });
  });

  test('uses the given cycle for a review without its own', () => {
    expect(reviewToPdm({ ...MockProposalScienceReviewFrontend, cycle: '' }, 'cycle-2').cycle).toBe(
      'cycle-2'
    );
  });
});
