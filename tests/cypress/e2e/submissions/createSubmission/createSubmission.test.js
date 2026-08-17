import {
  clickHome,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyMockedProposalOnLandingPageIsVisible,
  clearLocalStorage,
  verifyOsdDataCycleID,
  verifyOsdDataCycleDescription,
  verifyOsdDataProposalOpen,
  verifyOsdDataProposalClose,
  addM2TargetAndAutoLink,
  mockResolveTargetAPI,
  verifyMockedScienceIdeaOnLandingPageIsVisible,
  mockValidateSVIdeaAPI,
  beginScienceIdeaSession,
  selectScienceVerificationCycle,
  completeScienceIdeaCreation,
  createScienceIdeaSession,
  createStandardProposalSession,
  uploadTestFile,
  verifyTestFileUploaded,
  clickFileUpload,
  clickStatusIconNav,
  pageConfirmed,
  clickToValidateSV,
  verifyAlertFooter,
  clickToConfirmProposalSubmission,
  verifyData,
  isLiveMode
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    mockResolveTargetAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Create a basic science verification idea, verify AutoLink', () => {
    // This is the one flow that needs to assert on the raw OSD content mid-creation, so it uses
    // the finer-grained pieces instead of createScienceIdeaSession. The expected values
    // themselves necessarily differ between modes - the stub fixture's SV cycle isn't the same
    // cycle a real backend has actually seeded (see clickCycleSelectionSV's comment).
    beginScienceIdeaSession(standardUser);
    if (isLiveMode()) {
      verifyOsdDataCycleID('TEST_SKAO_2027_1_ID');
      verifyOsdDataCycleDescription('TEST Low AA2 Science Verification');
      verifyOsdDataProposalOpen('2026-03-27T12:00:00.000Z');
      verifyOsdDataProposalClose('2027-04-01T15:00:00.000Z');
    } else {
      verifyOsdDataCycleID('SKAO_2027_1_ID');
      verifyOsdDataCycleDescription('Low AA2 Science Verification'); //verify OSD data
      verifyOsdDataProposalOpen('20260327T12:00:00.000Z'); //verify OSD data
      verifyOsdDataProposalClose('20260512T15:00:00.000Z'); //verify OSD data
    }
    selectScienceVerificationCycle();
    completeScienceIdeaCreation();
    addM2TargetAndAutoLink('Continuum');
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedScienceIdeaOnLandingPageIsVisible();
  });

  it(
    'SV Flow: Create science verification idea, Observing mode Continuum, verify sensitivity calculator results, validate and submit',
    { jiraKey: 'XTP-96352' },
    function () {
      // The PDF upload step needs real AWS S3 credentials, sourced from Vault in a proper
      // deployment - our local minikube deploy of ska-oso-services runs with vault.enabled=false
      // (see its Makefile), which injects a dummy AWS key/secret instead, so any live upload
      // fails. Skip until that's addressed; this isn't a test-code fix.
      if (isLiveMode()) {
        this.skip();
      }
      createScienceIdeaSession(standardUser);
      mockValidateSVIdeaAPI();
      addM2TargetAndAutoLink('Continuum', 'This is a summary of the science idea.');
      clickStatusIconNav('statusId3'); //Click to description page
      pageConfirmed('DESCRIPTION');
      uploadTestFile('testFile.pdf');
      verifyTestFileUploaded('testFile.pdf');
      clickFileUpload();
      verifyAlertFooter('Science Justification PDF successfully uploaded');
      clickStatusIconNav('statusId7'); //Click to data product page
      pageConfirmed('DATA PRODUCT');
      verifyData('dataProductType', 'Images');
      //Verify sens calc results
      verifyData('field-targetName', 'M2');
      verifyData('field-continuumSensitivityWeighted', '193.43 μJy/beam');
      verifyData('field-continuumConfusionNoise', '1.57 μJy/beam');
      verifyData('field-continuumTotalSensitivity', '193.44 μJy/beam');
      verifyData('field-continuumSynthBeamSize', '5.51 x 2.87 arcsec²');
      verifyData('field-continuumSurfaceBrightnessSensitivity', '375.92 K');
      verifyData('field-spectralSensitivityWeighted', '42.38 mJy/beam');
      verifyData('field-spectralConfusionNoise', '2.67 μJy/beam');
      verifyData('field-spectralTotalSensitivity', '42.38 mJy/beam');
      verifyData('field-spectralSynthBeamSize', '5.93 x 3.97 arcsec²');
      verifyData('field-spectralSurfaceBrightnessSensitivity', '5.5e+4 K');
      verifyData('field-integrationTime', '1.00 h');
      clickToValidateSV();
      cy.wait('@mockValidateSVIdea');
      verifyAlertFooter('Science Verification Idea is Valid');
      clickToConfirmProposalSubmission();
      verifyAlertFooter('Submission was successful');
    }
  );

  it(
    'SV Flow: Create science verification idea, Observing mode Spectral, verify sensitivity calculator results, validate and submit',
    { jiraKey: 'XTP-96345' },
    function () {
      // The PDF upload step needs real AWS S3 credentials, sourced from Vault in a proper
      // deployment - our local minikube deploy of ska-oso-services runs with vault.enabled=false
      // (see its Makefile), which injects a dummy AWS key/secret instead, so any live upload
      // fails. Skip until that's addressed; this isn't a test-code fix.
      if (isLiveMode()) {
        this.skip();
      }
      createScienceIdeaSession(standardUser);
      mockValidateSVIdeaAPI();
      addM2TargetAndAutoLink('Spectral', 'This is a summary of the science idea.');
      clickStatusIconNav('statusId3'); //Click to description page
      pageConfirmed('DESCRIPTION');
      uploadTestFile('testFile.pdf');
      verifyTestFileUploaded('testFile.pdf');
      clickFileUpload();
      verifyAlertFooter('Science Justification PDF successfully uploaded');
      clickStatusIconNav('statusId7'); //Click to data product page
      pageConfirmed('DATA PRODUCT');
      //Verify sens calc results
      verifyData('field-targetName', 'M2');
      verifyData('field-spectralSensitivityWeighted', '73.23 mJy/beam');
      verifyData('field-spectralConfusionNoise', '2.65 μJy/beam');
      verifyData('field-spectralTotalSensitivity', '73.23 mJy/beam');
      verifyData('field-spectralSynthBeamSize', '5.92 x 3.96 arcsec²');
      verifyData('field-spectralSurfaceBrightnessSensitivity', '9.5e+4 K');
      verifyData('field-integrationTime', '1.00 h');
      clickToValidateSV();
      cy.wait('@mockValidateSVIdea');
      verifyAlertFooter('Science Verification Idea is Valid');
      clickToConfirmProposalSubmission();
      verifyAlertFooter('Submission was successful');
    }
  );

  it(
    'SV Flow: Create science verification idea, Observing mode PST, verify sensitivity calculator results, validate and submit',
    { jiraKey: 'XTP-96353' },
    function () {
      // The PDF upload step needs real AWS S3 credentials, sourced from Vault in a proper
      // deployment - our local minikube deploy of ska-oso-services runs with vault.enabled=false
      // (see its Makefile), which injects a dummy AWS key/secret instead, so any live upload
      // fails. Skip until that's addressed; this isn't a test-code fix.
      if (isLiveMode()) {
        this.skip();
      }
      createScienceIdeaSession(standardUser);
      mockValidateSVIdeaAPI();
      addM2TargetAndAutoLink('PST', 'This is a summary of the science idea.');
      clickStatusIconNav('statusId3'); //Click to description page
      pageConfirmed('DESCRIPTION');
      uploadTestFile('testFile.pdf');
      verifyTestFileUploaded('testFile.pdf');
      clickFileUpload();
      verifyAlertFooter('Science Justification PDF successfully uploaded');
      clickStatusIconNav('statusId7'); //Click to data product page
      pageConfirmed('DATA PRODUCT');
      //Verify sens calc results - Not currently available fr PST
      verifyData(
        'borderedSection-content',
        'PST mode is not currently supported within the Sensitivity Calculator application.'
      );
      clickToValidateSV();
      cy.wait('@mockValidateSVIdea');
      verifyAlertFooter('Science Verification Idea is Valid');
      clickToConfirmProposalSubmission();
      verifyAlertFooter('Submission was successful');
    }
  );

  it('Proposal Flow: Create a basic proposal', { jiraKey: 'XTP-59739' }, function () {
    // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification
    // one is seeded) - stub-only until one is, this isn't a test-code fix.
    if (isLiveMode()) {
      this.skip();
    }
    createStandardProposalSession(standardUser);
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });
});
