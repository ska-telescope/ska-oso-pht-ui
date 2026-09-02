import {
  clickHome,
  pageConfirmed,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyMockedProposalOnLandingPageIsVisible,
  mockEmailAPI,
  clearLocalStorage,
  clickStatusIconNav,
  clickToAddTarget,
  addM2TargetUsingResolve,
  clickObservationSetup,
  selectObservingMode,
  verifyAutoLinkAlertFooter,
  mockResolveTargetAPI,
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
  createScienceIdeaSession,
  createStandardProposalSession
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Edit Proposal', () => {
  // The PDF upload step needs real AWS S3 credentials, sourced from Vault in a proper deployment -
  // our local minikube deploy of ska-oso-services runs with vault.enabled=false (see its
  // Makefile), which injects a dummy AWS key/secret instead, so any live upload fails. Skip until
  // that's addressed - this isn't a test-code fix - and remove this skip (and verify it) at that
  // point rather than rewriting it from scratch.
  //
  // Skipped via describe.skip() (not this.skip() inside a function(){} test) - see
  // reviewScience.test.js's comment: a function(){...this.skip()} test sharing a spec with
  // cy.intercept().as() elsewhere (here, the Proposal Flow describe below and this describe's own
  // mockEmailAPI/mockResolveTargetAPI) reliably corrupts Cypress's command tracking.
  // describe.skip() never invokes any of its hooks or tests at all, so it sidesteps that entirely.
  describe.skip('SV Flow', () => {
    beforeEach(() => {
      mockEmailAPI();
      mockResolveTargetAPI();
    });

    afterEach(() => {
      clearLocalStorage();
    });

    it('SV Flow: Edit a basic science idea, ensure science idea is valid and the submit', () => {
      createScienceIdeaSession(standardUser);
      mockValidateAPI();

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

  // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification one
  // is seeded) - stub-only until one is, this isn't a test-code fix. Skipped via describe.skip()
  // for the same command-tracking-corruption reason as the SV Flow describe above.
  describe.skip('Proposal Flow', () => {
    beforeEach(() => {
      mockEmailAPI();
      mockResolveTargetAPI();
    });

    afterEach(() => {
      clearLocalStorage();
    });

    it(
      'Proposal Flow: Edit a basic proposal, ensure proposal is valid and then submit',
      { jiraKey: 'XTP-71405' },
      () => {
        createStandardProposalSession(standardUser);
        mockValidateAPI();

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
        // The band midpoint (200 MHz) isn't a valid centre frequency - a valid one needs the SPW's
        // first coarse channel to be even (see isCentralFrequencyDivisible), matching ODT's own
        // validated LOW spectral window schema. 199.609375 MHz is the nearest valid point (also
        // ODT's own default), so set that explicitly rather than fail the observation page's own
        // validation before the proposal is even submitted.
        updateFieldValue('centralFrequency', '199.609375');
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
