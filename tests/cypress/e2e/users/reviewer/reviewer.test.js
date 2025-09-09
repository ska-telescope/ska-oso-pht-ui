import {
  clickUserMenuProposals,
  clickUserMenuReviews,
  initializeAsReviewerScience
} from '../../common/common';
import { reviewerScience } from '../users';

describe('Reviewer', () => {
  beforeEach(() => {
    initializeAsReviewerScience();
  });
  it('Navigate using the dropdown menu', () => {
    clickUserMenuProposals();
    clickUserMenuReviews();
  });
  it('Perform a review', () => {
    clickUserMenuReviews();
    // TODO : Perhaps do some stuff in here ?
  });
});
