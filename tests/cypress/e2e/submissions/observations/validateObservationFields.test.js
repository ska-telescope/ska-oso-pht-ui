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
  mockCreateSubmissionAPI,
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
  updateFieldValue,
  verifyFieldError,
  checkFieldDisabled
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('Validate Observation Fields', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateSubmissionAPI();
    mockOSDAPI();
    mockResolveTargetAPI();

    //Create autoLink submission
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
    cy.wait('@mockCreateSubmission');
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
    //verify addTarget is disabled after autoLink
    checkFieldDisabled('addTargetButton', true);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Verify observation fields', () => {
    clickStatusIconNav('statusId5'); //Click to observation page
    pageConfirmed('OBSERVATION');
    updateFieldValue('continuumBandwidth', '500'); //update continuum bandwidth to an invalid value
    verifyFieldError(
      'continuumBandwidth',
      'Maximum bandwidth for this array assembly (150.00 MHz) exceeded',
      true
    ); //verify field error for continuum bandwidth
  });
});
