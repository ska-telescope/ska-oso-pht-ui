import {
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  clickAddSubmission,
  clickCreateSubmission,
  enterScienceVerificationIdeaTitle,
  clickCycleSelectionSV,
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
  checkFieldDisabled,
  mockCreateSVIdeaAPI,
  mockOSDAPI
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('SV Flow: Validate Observation Fields', () => {
  beforeEach(() => {
    mockOSDAPI();
    initialize(standardUser);
    mockCreateSVIdeaAPI();
    mockResolveTargetAPI();

    //Create autoLink submission
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
    //verify addTarget is disabled after autoLink
    checkFieldDisabled('addTargetButton', true);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('SV Flow: Validate continuum bandwidth field', () => {
    clickStatusIconNav('statusId5'); //Click to observation page
    pageConfirmed('OBSERVATION');
    updateFieldValue('continuumBandwidth', '500'); //update continuum bandwidth to an invalid value
    verifyFieldError(
      'continuumBandwidth',
      'Maximum bandwidth for this array assembly (150.00 MHz) exceeded',
      true
    ); //verify field error for continuum bandwidth
  });

  it('SV Flow: Valid frequency shows OK in the observation breadcrumb', () => {
    clickStatusIconNav('statusId5');
    pageConfirmed('OBSERVATION');
    // Default auto-linked observation: 200 MHz central frequency, 150 MHz bandwidth
    // Valid centre range for LOW (50–350 MHz band): [50+75, 350-75] = [125, 275] MHz
    cy.get('[data-testid="statusId5"]')
      .should('have.attr', 'aria-label')
      .and('include', 'OK');
  });

  it('SV Flow: Frequency bandwidth extending outside band edge shows Error in the observation breadcrumb', () => {
    clickStatusIconNav('statusId5');
    pageConfirmed('OBSERVATION');
    // 110 MHz: lower edge = 110 - 75 = 35 MHz, below the 50 MHz band floor
    updateFieldValue('centralFrequency', '110');
    cy.get('[data-testid="statusId5"]')
      .should('have.attr', 'aria-label')
      .and('include', 'Error');
  });
});
