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
  updateFieldValue,
  verifyDataInTable,
  clickAddDataProduct,
  addContinuumImagesObservatoryDataProduct,
  clickToLinkTargetAndObservation,
  clickObservationFromTable,
  verifySensitivityCalculatorStatusSuccess,
  validateProposal,
  clickFileUpload,
  clickToValidateSV,
  uploadTestFile,
  verifyTestFileUploaded,
  mockValidateAPI,
  verifyAlertFooter,
  clickToSubmitProposal,
  clickToConfirmProposalSubmission,
  mockCreateSVIdeaAPI,
  mockCreateProposalAPI,
  mockOSDAPI
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Edit Proposal', () => {
  describe('SV Flow', () => {
    beforeEach(() => {
      mockOSDAPI();
      initialize(standardUser, {
        'cypress:proposalEdit': 'true',
        'cypress:scienceVerificationIdea': 'true'
      });
      mockEmailAPI();
      mockResolveTargetAPI();
      mockValidateAPI();
    });

    afterEach(() => {
      clearLocalStorage();
    });

    it('SV Flow: Edit a basic science idea, ensure science idea is valid and the submit', () => {
      cy.wait('@mockOSDData');
      mockCreateSVIdeaAPI();
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
      uploadTestFile('testFile.pdf');
      verifyTestFileUploaded('testFile.pdf');
      clickFileUpload();
      // The upload is a real async round trip (presigned URL + S3 PUT) that sets
      // sciencePDF.isUploadedPdf on completion - wait for the preview button, which only
      // renders once that's true, otherwise validate can run before the upload has landed.
      cy.get('[data-testid="pdfPreviewButtonTestId"]').should('exist');
      clickToValidateSV();
      cy.wait('@mockValidate');
      verifyAlertFooter('Science Verification Idea is Valid');
      clickToConfirmProposalSubmission();
      verifyAlertFooter('Submission was successful');
    });
  });

  describe('Proposal Flow', () => {
    beforeEach(() => {
      mockOSDAPI();
      initialize(standardUser, { 'cypress:proposalEdit': 'true' });
      mockEmailAPI();
      mockResolveTargetAPI();
      mockValidateAPI();
    });

    afterEach(() => {
      clearLocalStorage();
    });

    it(
      'Proposal Flow: Edit a basic proposal, ensure proposal is valid and then submit',
      { jiraKey: 'XTP-71405' },
      () => {
        cy.wait('@mockOSDData');
        mockCreateProposalAPI();
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
        // The default centre frequency (band midpoint) isn't on the coarse-channel grid (see
        // isCentralFrequencyDivisible) - set a valid one so the observation page doesn't fail
        // its own validation before the proposal is even submitted.
        updateFieldValue('centralFrequency', '200.390625');
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
        uploadTestFile('testFile.pdf');
        verifyTestFileUploaded('testFile.pdf');
        clickFileUpload();
        verifyAlertFooter('Science Justification PDF successfully uploaded');
        clickStatusIconNav('statusId6'); //Click to technical page
        pageConfirmed('TECHNICAL');
        uploadTestFile('testFile.pdf');
        verifyTestFileUploaded('testFile.pdf');
        clickFileUpload();
        verifyAlertFooter('Technical Justification PDF successfully uploaded');
        validateProposal();
        cy.wait('@mockValidate');
        verifyAlertFooter('Proposal is Valid');
        //submit proposal
        clickToSubmitProposal();
        cy.wait('@mockValidate');
        clickToConfirmProposalSubmission();
        verifyAlertFooter('Submission was successful');
      }
    );
  });
});
