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
  selectScienceCategory,
  spyOnResolveTargetAPI,
  waitForResolveTarget,
  addSubmissionSummary,
  clickEditIconForRow,
  clickAddObservationEntry,
  updateFieldValue,
  verifyDataInTable,
  clickAddDataProduct,
  addContinuumImagesObservatoryDataProduct,
  clickToLinkTargetAndObservation,
  clickObservationFromTable,
  verifySensitivityCalculatorStatusSuccess,
  clickFileUpload,
  uploadTestFile,
  verifyTestFileUploaded,
  mockValidateAPI,
  verifyAlertFooter,
  clickToSubmitProposal,
  clickToConfirmProposalSubmission,
  createStandardProposalSession
} from '../../../support/common.js';
import { standardUser } from '../../../support/users.js';

describe('Edit Proposal', () => {
  // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification one
  // is seeded) - stub-only until one is, this isn't a test-code fix. Skipped via describe.skip()
  // (not this.skip()) - see reviewScience.cy.js's comment on command-tracking corruption.
  describe.skip('Proposal Flow', () => {
    beforeEach(() => {
      mockEmailAPI();
      spyOnResolveTargetAPI();
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
        selectScienceCategory('Cosmology');
        addSubmissionSummary('This is a summary of the proposal.');
        clickStatusIconNav('statusId4'); //Click to target page
        pageConfirmed('TARGET');
        //add target
        addM2TargetUsingResolve();
        waitForResolveTarget();
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
        //submit proposal (submit validates first)
        clickToSubmitProposal();
        cy.wait('@mockValidate');
        verifyAlertFooter('Proposal is Valid');
        clickToConfirmProposalSubmission();
        verifyAlertFooter('Submission was successful');
      }
    );
  });
});
