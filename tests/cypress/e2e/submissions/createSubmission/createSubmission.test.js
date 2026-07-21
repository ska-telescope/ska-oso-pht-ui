import {
  clickHome,
  enterProposalTitle,
  verifyOnLandingPage,
  verifyOnLandingPageFilterIsVisible,
  verifyMockedProposalOnLandingPageIsVisible,
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  clickAddSubmission,
  clickCreateSubmission,
  verifySubmissionCreatedAlertFooter,
  enterScienceVerificationIdeaTitle,
  clickCycleSelectionSV,
  clickCycleSelectionMockProposal,
  clickProposalTypePrincipleInvestigator,
  clickSubProposalTypeTargetOfOpportunity,
  mockOSDAPI,
  verifyOsdDataCycleID,
  verifyOsdDataCycleDescription,
  verifyOsdDataProposalOpen,
  verifyOsdDataProposalClose,
  pageConfirmed,
  verifyScienceIdeaCreatedAlertFooter,
  selectObservingMode,
  clickStatusIconNav,
  addM2TargetUsingResolve,
  clickToAddTarget,
  mockResolveTargetAPI,
  verifyAutoLinkAlertFooter,
  verifyMockedScienceIdeaOnLandingPageIsVisible,
  mockCreateSVIdeaAPI,
  mockCreateProposalAPI,
  addSubmissionSummary,
  uploadTestFile,
  verifyTestFileUploaded,
  clickFileUpload,
  clickToValidateSV,
  verifyAlertFooter,
  clickToConfirmProposalSubmission,
  verifyData,
  mockValidateSVIdeaAPI
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    mockOSDAPI();
    initialize(standardUser);
    mockResolveTargetAPI();
    mockValidateSVIdeaAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Create a basic science verification idea, verify AutoLink', () => {
    mockCreateSVIdeaAPI();
    clickAddSubmission();
    cy.wait('@mockOSDData');
    verifyOsdDataCycleID('SKAO_2027_1_ID');
    verifyOsdDataCycleDescription('Low AA2 Science Verification'); //verify OSD data
    verifyOsdDataProposalOpen('20260327T12:00:00.000Z'); //verify OSD data
    verifyOsdDataProposalClose('20260512T15:00:00.000Z'); //verify OSD data
    clickCycleSelectionSV();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSVIdea');
    verifyScienceIdeaCreatedAlertFooter();
    pageConfirmed('TEAM');
    clickStatusIconNav('statusId2'); //Click to details page
    pageConfirmed('DETAILS');
    selectObservingMode('Continuum');
    clickStatusIconNav('statusId4'); //Click to target page
    pageConfirmed('TARGET');
    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();
    //Verify AutoLink to OSD data
    verifyAutoLinkAlertFooter();
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedScienceIdeaOnLandingPageIsVisible();
  });

  it(
    'SV Flow: Create science verification idea, Observing mode Continuum, verify sensitivity calculator results, validate and submit',
    { jiraKey: 'XTP-96352' },
    () => {
      mockCreateSVIdeaAPI();
      clickAddSubmission();
      cy.wait('@mockOSDData');
      clickCycleSelectionSV();
      clickCycleConfirm();
      enterScienceVerificationIdeaTitle();
      clickCreateSubmission();
      cy.wait('@mockCreateSVIdea');
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
      //Verify AutoLink to OSD data
      verifyAutoLinkAlertFooter();
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
      // Recomputed against the corrected default centre frequency (200.390625 MHz, see
      // isCentralFrequencyDivisible / DEFAULT_CONTINUUM_OBSERVATION_LOW) - values read directly
      // from the actual sensitivity calculator output.
      verifyData('field-continuumSensitivityWeighted', '193.37 μJy/beam');
      verifyData('field-continuumConfusionNoise', '1.55 μJy/beam');
      verifyData('field-continuumTotalSensitivity', '193.37 μJy/beam');
      verifyData('field-continuumSynthBeamSize', '5.49 x 2.85 arcsec²');
      verifyData('field-continuumSurfaceBrightnessSensitivity', '375.80 K');
      verifyData('field-spectralSensitivityWeighted', '42.18 mJy/beam');
      verifyData('field-spectralConfusionNoise', '2.63 μJy/beam');
      verifyData('field-spectralTotalSensitivity', '42.18 mJy/beam');
      verifyData('field-spectralSynthBeamSize', '5.91 x 3.95 arcsec²');
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
    () => {
      mockCreateSVIdeaAPI();
      clickAddSubmission();
      cy.wait('@mockOSDData');
      clickCycleSelectionSV();
      clickCycleConfirm();
      enterScienceVerificationIdeaTitle();
      clickCreateSubmission();
      cy.wait('@mockCreateSVIdea');
      verifyScienceIdeaCreatedAlertFooter();
      pageConfirmed('TEAM');
      clickStatusIconNav('statusId2'); //Click to details page
      pageConfirmed('DETAILS');
      selectObservingMode('Spectral');
      addSubmissionSummary('This is a summary of the science idea.');
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
    () => {
      mockCreateSVIdeaAPI();
      clickAddSubmission();
      cy.wait('@mockOSDData');
      clickCycleSelectionSV();
      clickCycleConfirm();
      enterScienceVerificationIdeaTitle();
      clickCreateSubmission();
      cy.wait('@mockCreateSVIdea');
      verifyScienceIdeaCreatedAlertFooter();
      pageConfirmed('TEAM');
      clickStatusIconNav('statusId2'); //Click to details page
      pageConfirmed('DETAILS');
      selectObservingMode('PST');
      addSubmissionSummary('This is a summary of the science idea.');
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

  it('Proposal Flow: Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    mockCreateProposalAPI();
    clickAddSubmission();
    cy.wait('@mockOSDData');
    clickCycleSelectionMockProposal();
    clickCycleConfirm();
    enterProposalTitle();
    clickProposalTypePrincipleInvestigator();
    clickSubProposalTypeTargetOfOpportunity();
    clickCreateSubmission();
    cy.wait('@mockCreateProposal');
    verifySubmissionCreatedAlertFooter();
    pageConfirmed('TEAM');
    clickHome();
    verifyOnLandingPage();
    verifyOnLandingPageFilterIsVisible();
    verifyMockedProposalOnLandingPageIsVisible();
  });
});
