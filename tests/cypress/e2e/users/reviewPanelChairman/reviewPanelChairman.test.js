import {
  clickUserMenuProposals,
  clickUserMenuReviews,
  clickUserMenuDecisions, // TODO: implment the function as doesn't exist yet
  initialize
} from '../../common/common';

describe('Review Coordinator', () => {
  beforeEach(() => {
    initialize();
  });
  it('Navigate using the dropdown menu', () => {
    clickUserMenuProposals();
    clickUserMenuReviews();
    // clickUserMenuDecisions();
    clickUserMenuProposals();
  });
  it('Make a review decision', () => {
    // clickUserMenuDecisions();
    // TODO : Perhaps do some stuff in here ?
  });
});
