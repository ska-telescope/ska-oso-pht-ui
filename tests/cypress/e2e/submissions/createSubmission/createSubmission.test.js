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
  clickFileUploadArea,
  uploadTestFile,
  verifyTestFileUploaded,
  clickFileUpload,
  clickToValidateSV,
  verifyAlertFooter,
  clickToConfirmProposalSubmission,
  verifyProductType,
  verifySensitivityCalculatorResultTargetName,
  verifySensitivityCalculatorResultWeightedContinuumSensitivity,
  verifyData
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Creating Proposal', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockOSDAPI();
    mockResolveTargetAPI();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it.skip('SV Flow: Create a basic science verification idea, verify AutoLink', () => {
    mockCreateSVIdeaAPI();
    clickAddSubmission();
    cy.wait('@mockOSDData');
    verifyOsdDataCycleID('SKAO_2027_1');
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
      clickFileUploadArea();
      uploadTestFile('testFile.pdf');
      verifyTestFileUploaded('testFile.pdf');
      clickFileUpload();
      clickStatusIconNav('statusId7'); //Click to data product page
      pageConfirmed('DATA PRODUCT');
      //Verify sens calc results
      verifyData('dataProductType', 'Images');
      verifyData('field-targetName', 'M2');
      verifyData('field-continuumSensitivityWeighted', '193.40 μJy/beam');
      verifyData('field-continuumConfusionNoise', '1.56 μJy/beam');
      verifyData('field-continuumTotalSensitivity', '193.40 μJy/beam');
      verifyData('field-continuumSynthBeamSize', '5.50 x 2.86 arcsec²');
      verifyData('field-continuumSurfaceBrightnessSensitivity', '375.86 K');
      verifyData('field-spectralSensitivityWeighted', '42.28 mJy/beam');
      verifyData('field-spectralConfusionNoise', '2.65 μJy/beam');
      verifyData('field-spectralTotalSensitivity', '42.28 mJy/beam');
      verifyData('field-spectralSynthBeamSize', '5.92 x 3.96 arcsec²');
      verifyData('field-spectralSurfaceBrightnessSensitivity', '5.5e+4 K');
      verifyData('field-integrationTime', '1.00 h');
      clickToValidateSV();
      cy.wait('@mockValidate');
      verifyAlertFooter('Science Verification Idea is Valid');
      clickToConfirmProposalSubmission();
      cy.wait('@mockUpdateSVIdea');
      verifyAlertFooter('Submission was successful');
    }
  );

  it.skip('Proposal Flow: Create a basic proposal', { jiraKey: 'XTP-59739' }, () => {
    mockCreateProposalAPI();
    clickAddSubmission();
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
