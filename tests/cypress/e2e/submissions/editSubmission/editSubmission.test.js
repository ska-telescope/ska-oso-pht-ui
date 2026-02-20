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
  clickToValidateSV,
  uploadTestFile,
  verifyTestFileUploaded,
  mockValidateAPI,
  verifyAlertFooter,
  clickToSubmitProposal,
  clickToConfirmProposalSubmission,
  mockUpdateProposalAPI,
  mockUpdateSVIdeaAPI,
  mockCreateSVIdeaAPI,
  mockCreateProposalAPI
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

beforeEach(() => {
  initialize(standardUser);
  mockCreateSVIdeaAPI();
  mockCreateProposalAPI();
  mockEmailAPI();
  mockResolveTargetAPI();
  mockValidateAPI();
  mockUpdateProposalAPI();
  mockUpdateSVIdeaAPI();
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

  it(
    'SV Flow: Edit a basic science idea, ensure science idea is valid and the submit',
    { jiraKey: 'XTP-96352' },
    () => {
      createScienceIdeaLoggedIn();
      cy.wait('@mockCreateSVIdea');
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
      addM2TargetUsingResolve(); //add target
      cy.wait('@mockResolveTarget');
      clickToAddTarget();
      verifyAutoLinkAlertFooter(); //Verify AutoLink to OSD data
      clickStatusIconNav('statusId3'); //Click to description page
      pageConfirmed('DESCRIPTION');
      clickFileUploadArea();
      uploadTestFile('testFile.pdf');
      verifyTestFileUploaded('testFile.pdf');
      clickFileUpload();
      clickToValidateSV();
      cy.wait('@mockValidate');
      verifyAlertFooter('Science Verification Idea is Valid');
      clickToConfirmProposalSubmission();
      cy.wait('@mockUpdateSVIdea');
      verifyAlertFooter('Submission was successful');
    }
  );

  it(
    'Proposal Flow: Edit a basic proposal, ensure proposal is valid and then submit',
    { jiraKey: 'XTP-71405' },
    () => {
      createStandardProposalLoggedIn();
      cy.wait('@mockCreateProposal');
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
      clickStatusIconNav('statusId2'); //Click to general page
      pageConfirmed('GENERAL');
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
      clickStatusIconNav('statusId3'); //Click to science page
      pageConfirmed('SCIENCE');
      clickFileUploadArea();
      uploadTestFile('testFile.pdf');
      verifyTestFileUploaded('testFile.pdf');
      clickFileUpload();
      clickStatusIconNav('statusId6'); //Click to technical page
      pageConfirmed('TECHNICAL');
      clickFileUploadArea();
      uploadTestFile('testFile.pdf');
      verifyTestFileUploaded('testFile.pdf');
      clickFileUpload();
      validateProposal();
      cy.wait('@mockValidate');
      verifyAlertFooter('Proposal is Valid');
      //submit proposal
      clickToSubmitProposal();
      cy.wait('@mockValidate');
      clickToConfirmProposalSubmission();
      cy.wait('@mockUpdateProposal');
      verifyAlertFooter('Submission was successful');
    }
  );
});
