import {
  clickUserMenuProposals,
  clickUserMenuDecisions,
  initializeAsReviewerChairman
} from '../../common/common';

describe('Review Chairman', () => {
  beforeEach(() => {
    initializeAsReviewerChairman();
  });
  it('Navigate using the dropdown menu', () => {
    clickUserMenuProposals();
    clickUserMenuDecisions();
    clickUserMenuProposals();
  });
  it('Make a review decision', () => {
    // TODO: implement the function as doesn't exist yet
    // clickUserMenuDecisions();
    // TODO : Perhaps do some stuff in here ?
  });
});
