import {
  clickLoginUser,
  clickUserMenuProposals,
  clickUserMenuDecisions,
  initialize
} from '../../common/common';
import { reviewerChairman } from '../users';

describe('Review Chairman', () => {
  beforeEach(() => {
    initialize();
    cy.mockLoginButton(reviewerChairman);
  });
  it('Navigate using the dropdown menu', () => {
    clickLoginUser();
    clickUserMenuProposals();
    clickUserMenuDecisions();
    clickUserMenuProposals();
  });
  it('Make a review decision', () => {
    clickLoginUser();

    // TODO: implement the function as doesn't exist yet
    // clickUserMenuDecisions();
    // TODO : Perhaps do some stuff in here ?
  });
});
