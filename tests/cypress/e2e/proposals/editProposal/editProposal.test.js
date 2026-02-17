import {
  clickHome,
  pageConfirmed,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyMockedProposalOnLandingPageIsVisible,
  mockEmailAPI,
  initialize,
  clearLocalStorage,
  createScienceIdeaLoggedIn,
  clickStatusIconNav,
  clickToAddTarget,
  addM2TargetUsingResolve,
  clickObservationSetup,
  mockCreateSubmissionAPI,
  verifySubmissionCreatedAlertFooter,
  verifyScienceIdeaCreatedAlertFooter,
  selectObservingMode,
  verifyAutoLinkAlertFooter,
  mockResolveTargetAPI,
  createStandardProposalLoggedIn,
  addSubmissionSummary,
  clickEditIconForRow,
  verifyMockedScienceIdeaOnLandingPageIsVisible,
  clickAddObservationEntry,
  verifyDataInTable,
  clickAddDataProduct,
  addContinuumImagesObservatoryDataProduct,
  clickToLinkTargetAndObservation,
  clickObservationFromTable,
  verifySensitivityCalculatorStatusSuccess,
  validateProposal,
  clickFileUploadArea,
  clickFileUpload,
  mockGetSignedUrlAPI,
  mockUploadToS3API
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

beforeEach(() => {
  initialize(standardUser);
  mockCreateSubmissionAPI();
  mockEmailAPI();
  mockResolveTargetAPI();
  mockGetSignedUrlAPI();
  mockUploadToS3API();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Edit Proposal', () => {
  before(() => {
    cy.window().then(win => {
      win.localStorage.setItem('cypress:proposalEdit', 'true');
      win.localStorage.setItem('cypress:scienceVerificationIdea', 'true');
    });
  });

  it('SV Flow: Edit a basic science idea', () => {
    createScienceIdeaLoggedIn();
    cy.wait('@mockCreateSubmission');
    verifyScienceIdeaCreatedAlertFooter();
    pageConfirmed('TEAM');

    //edit existing science verification idea
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedScienceIdeaOnLandingPageIsVisible();
    clickEditIconForRow('review-table', 'Science Verification');
    pageConfirmed('TITLE');
    //complete mandatory fields
    clickStatusIconNav('statusId2'); //Click to details page
    pageConfirmed('DETAILS');
    selectObservingMode('Continuum');
    addSubmissionSummary('This is a summary of the science idea.');
    clickStatusIconNav('statusId3'); //Click to description page
    pageConfirmed('DESCRIPTION');
    clickStatusIconNav('statusId4'); //Click to target page
    pageConfirmed('TARGET');
    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();
    //Verify AutoLink to OSD data
    verifyAutoLinkAlertFooter();
    clickStatusIconNav('statusId3'); //Click to description page
    pageConfirmed('DESCRIPTION');
    clickFileUploadArea();

    cy.get('[data-testid="fileUpload"] input[type="file"]').attachFile('testFile.pdf');

    // Assertions depend on your UI
    cy.contains('testFile.pdf').should('be.visible');
    clickFileUpload();
    cy.wait('@mockGetSignedUrl');
    cy.wait('@mockUploadToS3');
    //TODO: Mock endpoint for file upload and verify file upload success message once that is implemented

    //TODO: Verify SV is valid once mocking of file upload is resolved
    // clickToValidateSV();
  });

  it.skip('Proposal Flow: Edit a basic proposal', { jiraKey: 'XTP-71405' }, () => {
    createStandardProposalLoggedIn();
    cy.wait('@mockCreateSubmission');
    verifySubmissionCreatedAlertFooter();
    pageConfirmed('TEAM');

    //edit existing proposal
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
    clickEditIconForRow('review-table', 'Proposal');
    pageConfirmed('TITLE');

    //complete mandatory fields
    clickStatusIconNav('statusId2'); //Click to details page
    pageConfirmed('DETAILS');
    selectObservingMode('Cosmology');
    addSubmissionSummary('This is a summary of the proposal.');
    clickStatusIconNav('statusId4'); //Click to target page
    pageConfirmed('TARGET');
    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();
    clickStatusIconNav('statusId5'); //Click to observation page
    pageConfirmed('OBSERVATION');
    clickObservationSetup();
    clickAddObservationEntry();
    verifyDataInTable('review-table', 'Continuum');
    clickStatusIconNav('statusId7'); //Click to data product page
    pageConfirmed('DATA PRODUCT');
    clickAddDataProduct();
    addContinuumImagesObservatoryDataProduct();
    clickStatusIconNav('statusId8'); //Click to linking page
    pageConfirmed('LINKING');
    clickObservationFromTable();
    clickToLinkTargetAndObservation();
    verifySensitivityCalculatorStatusSuccess();
    clickStatusIconNav('statusId9'); //Click to calibration page
    pageConfirmed('CALIBRATION');
    validateProposal();
    // //TODO: Verify Proposal is valid once mocking of file upload is resolved
    // // verifyProposalIsValid()
    // //submit proposal
    // // clickToSubmitProposal();
    // // clickToConfirmProposalSubmission();
    // // //verify status of submitted proposal
    // // verifyFirstProposalOnLandingPageHasSubmittedStatus();
  });

  //TODO: Implement full scenario to point of submission
});
