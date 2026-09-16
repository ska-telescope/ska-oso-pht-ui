import {
  clearLocalStorage,
  clickStatusIconNav,
  pageConfirmed,
  updateDataProductField,
  verifyFieldError,
  addM2TargetAndAutoLink,
  mockResolveTargetAPI,
  mockEmailAPI,
  createScienceIdeaSession
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';
beforeEach(() => {
  mockEmailAPI();
  mockResolveTargetAPI();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Data product validation', () => {
  it('SV Flow: Verify channels out range', () => {
    createScienceIdeaSession(standardUser);
    addM2TargetAndAutoLink('Continuum', 'This is a summary of the science idea.');

    clickStatusIconNav('statusId7'); //Click to data product page
    pageConfirmed('DATA PRODUCT');

    updateDataProductField('channelsOut', '41'); //enter invalid channels out
    verifyFieldError('channelsOut', 'Valid range is 1 - 40', true); //verify field error
  });

  it('SV Flow: Deselecting all polarisations shows Error in the Data Product breadcrumb', () => {
    createScienceIdeaSession(standardUser);
    addM2TargetAndAutoLink('Continuum', 'This is a summary of the science idea.');

    clickStatusIconNav('statusId7'); //Click to data product page
    pageConfirmed('DATA PRODUCT');
    cy.get('[data-testid="statusId7"]').should('have.attr', 'aria-label').and('include', 'OK');

    // Default Continuum image data product ships with 'I' and 'XX' polarisations selected -
    // deselect both to reach the zero-polarisations state BTN-3269 made reachable.
    cy.get('[data-testid="polarisationsI"]').click();
    cy.get('[data-testid="polarisationsXX"]').click();

    cy.get('[data-testid="statusId7"]')
      .should('have.attr', 'aria-label')
      .and('include', 'Error');
  });
});
