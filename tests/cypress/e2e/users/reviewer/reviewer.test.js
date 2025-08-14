import {
  clickLoginUser,
  clickUserMenuProposals,
  clickUserMenuReviews,
  initialize
} from '../../common/common';
import { reviewerScience } from '../users';

describe('Reviewer', () => {
  beforeEach(() => {
    initialize();
    cy.mockLoginButton(reviewerScience);
  });
  it('Navigate using the dropdown menu', () => {
    clickLoginUser();
    clickUserMenuProposals();
    clickUserMenuReviews();
  });
  it('Perform a review', () => {
    clickLoginUser();
    clickUserMenuReviews();
    // TODO : Perhaps do some stuff in here ?
  });
});
