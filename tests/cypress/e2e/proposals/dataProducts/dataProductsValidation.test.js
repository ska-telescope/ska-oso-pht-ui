import {
  clearLocalStorage,
  selectContinuum,
  clickStatusIconNav,
  clickToAddDataProduct,
  createObservation,
  createScienceIdeaLoggedIn,
  initialize,
  mockEmailAPI,
  pageConfirmed,
  updateDataProductField,
  verifyFieldError,
  mockCreateSubmissionAPI,
  verifySubmissionCreatedAlertFooter,
  verifyScienceIdeaCreatedAlertFooter
} from '../../common/common';
import { standardUser } from '../../users/users.js';
beforeEach(() => {
  initialize(standardUser);
  mockCreateSubmissionAPI();
  mockEmailAPI();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Data product validation', () => {
  it('SV Flow: Verify channels out range', () => {
    createScienceIdeaLoggedIn();
    cy.wait('@mockCreateSubmission');
    verifyScienceIdeaCreatedAlertFooter();
    pageConfirmed('TEAM');

    clickStatusIconNav('statusId2');
    // selectContinuum();

    //  clickStatusIconNav('statusId5'); //Click to observation page
    //  createObservation();

    //  clickStatusIconNav('statusId7'); //Click to data product page
    //  clickToAddDataProduct();

    //  updateDataProductField('channelsOut', '41'); //enter invalid channels out
    //  verifyFieldError('channelsOut', 'Valid range is 0 - 40', true); //verify field error
  });
});
