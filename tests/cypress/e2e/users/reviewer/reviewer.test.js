import {
  clickUserMenuOverview,
  clickUserMenuProposals,
  clickUserMenuReviews,
  initialize
} from '../../common/common';

describe('Reviewer', () => {
  beforeEach(() => {
    initialize();
  });
  it('Navigate using the dropdown menu', () => {
    clickUserMenuProposals();
    clickUserMenuReviews();
    clickUserMenuOverview();
  });
  it('Perform a review', () => {
    clickUserMenuReviews();
    // TODO : Perhaps do some stuff in here ?
  });
});
