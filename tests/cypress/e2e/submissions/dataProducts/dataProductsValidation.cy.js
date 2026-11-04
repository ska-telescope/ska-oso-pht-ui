import {
  clearLocalStorage,
  clickStatusIconNav,
  pageConfirmed,
  updateFieldValue,
  addM2TargetAndAutoLink,
  mockEmailAPI,
  createScienceIdeaSession,
  pageStatus,
  setTickBox
} from '../../../support/common.js';
import { standardUser } from '../../../support/users.js';
beforeEach(() => {
  mockEmailAPI();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Data product validation', () => {
  it('SV Flow: Verify channels out range', () => {
    createScienceIdeaSession(standardUser);
    addM2TargetAndAutoLink('Continuum', 'This is a summary of the science idea.');

    clickStatusIconNav('Data Product');
    pageConfirmed('DATA PRODUCT');

    updateFieldValue('Channels Out', '41'); //enter invalid channels out
    cy.contains('Valid range is 1 - 40').should('be.visible'); //verify field error
  });

  it('SV Flow: Deselecting all polarisations shows Error in the Data Product breadcrumb', () => {
    createScienceIdeaSession(standardUser);
    addM2TargetAndAutoLink('Continuum', 'This is a summary of the science idea.');

    clickStatusIconNav('Data Product');
    pageConfirmed('DATA PRODUCT');
    pageStatus('Data Product').should('have.attr', 'aria-label').and('include', 'OK');

    // AutoLinking sets a freshly auto-linked Continuum data product's polarisations to
    // POLARISATIONS_DEFAULT (['I']) - deselect it to reach the zero-polarisations state
    // BTN-3269 made reachable.
    setTickBox('I', false);

    pageStatus('Data Product').should('have.attr', 'aria-label').and('include', 'Error');
  });
});
