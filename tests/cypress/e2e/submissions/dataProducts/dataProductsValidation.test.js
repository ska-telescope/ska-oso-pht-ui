import {
  clearLocalStorage,
  clickStatusIconNav,
  createScienceIdeaLoggedIn,
  initialize,
  mockEmailAPI,
  pageConfirmed,
  updateDataProductField,
  verifyFieldError,
  mockCreateSubmissionAPI,
  verifyScienceIdeaCreatedAlertFooter,
  selectObservingMode,
  addM2TargetUsingResolve,
  clickToAddTarget,
  mockResolveTargetAPI,
  verifyAutoLinkAlertFooter,
  addSubmissionSummary
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';
beforeEach(() => {
  initialize(standardUser);
  mockCreateSubmissionAPI();
  mockEmailAPI();
  mockResolveTargetAPI();
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

    clickStatusIconNav('statusId2'); //Click to details page
    pageConfirmed('DETAILS');
    selectObservingMode('Continuum');
    addSubmissionSummary('This is a summary of the science idea.');

    clickStatusIconNav('statusId4'); //Click to target page
    pageConfirmed('TARGET');
    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();
    verifyAutoLinkAlertFooter();

    clickStatusIconNav('statusId7'); //Click to data product page
    pageConfirmed('DATA PRODUCT');

    updateDataProductField('channelsOut', '41'); //enter invalid channels out
    verifyFieldError('channelsOut', 'Valid range is 0 - 40', true); //verify field error
  });
});
