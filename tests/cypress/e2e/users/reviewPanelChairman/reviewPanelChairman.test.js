import { clickUserMenuProposals, clickUserMenuReviews, initialize } from '../../common/common';

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
    // TODO: implement the function as doesn't exist yet
    // clickUserMenuDecisions();
    // TODO : Perhaps do some stuff in here ?
  });
});
