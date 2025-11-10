import {
  clearLocalStorage,
  selectContinuum,
  clickStatusIconNav,
  clickToAddDataProduct,
  createObservation,
  createScienceIdeaLoggedIn,
  initialize,
  mockCreateProposalAPI,
  mockEmailAPI,
  pageConfirmed,
  updateDataProductField,
  verifyFieldError,
  verifyProposalCreatedAlertFooter
} from '../../common/common';
import { standardUser } from '../../users/users.js';
beforeEach(() => {
  initialize(standardUser);
  mockCreateProposalAPI();
  mockEmailAPI();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Data product validation', () => {
  it.skip('Verify channels out range', () => {
    createScienceIdeaLoggedIn();
    cy.wait('@mockCreateProposal');
    verifyProposalCreatedAlertFooter();
    pageConfirmed('TEAM');

    // clickStatusIconNav('statusId2');
    // selectContinuum();

    //  clickStatusIconNav('statusId5'); //Click to observation page
    //  createObservation();

    //  clickStatusIconNav('statusId7'); //Click to data product page
    //  clickToAddDataProduct();

    //  updateDataProductField('channelsOut', '41'); //enter invalid channels out
    //  verifyFieldError('channelsOut', 'Valid range is 0 - 40', true); //verify field error
  });
});
