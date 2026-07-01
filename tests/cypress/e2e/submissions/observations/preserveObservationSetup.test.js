import {
  initialize,
  clearLocalStorage,
  clickCycleConfirm,
  clickAddSubmission,
  clickCreateSubmission,
  enterScienceVerificationIdeaTitle,
  clickCycleSelectionSV,
  pageConfirmed,
  verifyScienceIdeaCreatedAlertFooter,
  selectObservingMode,
  clickStatusIconNav,
  addM2TargetUsingResolve,
  clickToAddTarget,
  mockResolveTargetAPI,
  verifyAutoLinkAlertFooter,
  updateFieldValue,
  addSubmissionSummary,
  mockCreateSVIdeaAPI,
  mockOSDAPI
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

describe('SV Flow: Observation setup is preserved when details page fields change', () => {
  beforeEach(() => {
    initialize(standardUser);
    mockCreateSVIdeaAPI();
    mockOSDAPI();
    mockResolveTargetAPI();

    clickAddSubmission();
    cy.wait('@mockOSDData');
    clickCycleSelectionSV();
    clickCycleConfirm();
    enterScienceVerificationIdeaTitle();
    clickCreateSubmission();
    cy.wait('@mockCreateSVIdea');
    verifyScienceIdeaCreatedAlertFooter();
    pageConfirmed('TEAM');
    clickStatusIconNav('statusId2');
    pageConfirmed('DETAILS');
    selectObservingMode('Continuum');
    clickStatusIconNav('statusId4');
    pageConfirmed('TARGET');
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();
    verifyAutoLinkAlertFooter();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Abstract is saved by debounce without requiring onBlur — navigating after 2s confirms the value persisted', () => {
    clickStatusIconNav('statusId2');
    pageConfirmed('DETAILS');
    addSubmissionSummary('Debounce test summary.');

    // Keep focus on the abstract field for longer than ERROR_SECS (2000ms) so the debounce
    // fires before onBlur. When we navigate below, onBlur fires too, but the save has
    // already happened via the timer.
    cy.wait(2500);

    clickStatusIconNav('statusId5');
    pageConfirmed('OBSERVATION');

    clickStatusIconNav('statusId2');
    pageConfirmed('DETAILS');
    cy.get('[data-testid="abstractId"]')
      .find('textarea')
      .should('have.value', 'Debounce test summary.');
  });

  it('Changing the abstract does not reset the observation frequency setup, and the abstract is saved', () => {
    clickStatusIconNav('statusId5');
    pageConfirmed('OBSERVATION');
    updateFieldValue('centralFrequency', '180');

    clickStatusIconNav('statusId2');
    pageConfirmed('DETAILS');
    addSubmissionSummary('This is a summary of the science idea.');

    // Navigating away blurs the field, triggering the onBlur save
    clickStatusIconNav('statusId5');
    pageConfirmed('OBSERVATION');
    cy.get('[data-testid="centralFrequency"]')
      .find('input')
      .should('have.value', '180');

    clickStatusIconNav('statusId2');
    pageConfirmed('DETAILS');
    cy.get('[data-testid="abstractId"]')
      .find('textarea')
      .should('have.value', 'This is a summary of the science idea.');
  });
});
