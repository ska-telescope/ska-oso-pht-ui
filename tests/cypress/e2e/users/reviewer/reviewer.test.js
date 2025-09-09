import { clearLocalStorage, clickUserMenuProposals, clickUserMenuReviews, initialize } from '../../common/common';
import { reviewerScience } from '../users';

describe('Reviewer', () => {
  beforeEach(() => {
    initialize(reviewerScience);
  });

  afterEach(() => {
    clearLocalStorage();
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
