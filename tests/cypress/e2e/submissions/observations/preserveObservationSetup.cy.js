import {
  clearLocalStorage,
  pageConfirmed,
  clickStatusIconNav,
  updateFieldValue,
  addSubmissionSummary,
  addM2TargetAndAutoLink,
  createScienceIdeaSession
} from '../../../support/common.js';
import { standardUser } from '../../../support/users.js';

describe('SV Flow: Observation setup is preserved when details page fields change', () => {
  beforeEach(() => {
    createScienceIdeaSession(standardUser);
    addM2TargetAndAutoLink('Continuum');
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Changing the abstract does not reset the observation frequency setup, and the abstract is saved', () => {
    clickStatusIconNav('statusId5');
    pageConfirmed('OBSERVATION');
    updateFieldValue('centralFrequency', '180');

    clickStatusIconNav('statusId2');
    pageConfirmed('DETAILS');
    addSubmissionSummary('This is a summary of the science idea.');

    clickStatusIconNav('statusId5');
    pageConfirmed('OBSERVATION');
    // centralFrequency's testid is on the input itself (slotProps.htmlInput), not a wrapper.
    cy.get('[data-testid="centralFrequency"]').should('have.value', '180');

    clickStatusIconNav('statusId2');
    pageConfirmed('DETAILS');

    cy.get('[data-testid="abstractId"]').should(
      'have.value',
      'This is a summary of the science idea.'
    );
  });
});
