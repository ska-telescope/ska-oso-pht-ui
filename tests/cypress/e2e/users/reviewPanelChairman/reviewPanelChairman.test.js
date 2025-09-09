import { clickUserMenuProposals, clickUserMenuDecisions, initialize, clearLocalStorage } from '../../common/common';
import { reviewerChairman } from '../users.js';

describe('Review Chairman', () => {
  beforeEach(() => {
    initialize(reviewerChairman);
  });

  afterEach(() => {
    clearLocalStorage();
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
