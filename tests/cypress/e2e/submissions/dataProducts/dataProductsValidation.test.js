import {
  clearLocalStorage,
  clickStatusIconNav,
  pageConfirmed,
  updateFieldValue,
  addM2TargetAndAutoLink,
  spyOnResolveTargetAPI,
  mockEmailAPI,
  createScienceIdeaSession
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';
beforeEach(() => {
  mockEmailAPI();
  spyOnResolveTargetAPI();
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

    // ChannelsOutField is a SteppedNumberField, which puts data-testid directly on the <input>
    // (not on an outer wrapper) - updateFieldValue types straight into it, matching how other
    // SteppedNumberField-based fields (e.g. centralFrequency) are driven elsewhere.
    updateFieldValue('channelsOut', '41'); //enter invalid channels out
    cy.get('[data-testid="channelsOutError"]').should('contain.text', 'Valid range is 1 - 40'); //verify field error
  });

  it('SV Flow: Deselecting all polarisations shows Error in the Data Product breadcrumb', () => {
    createScienceIdeaSession(standardUser);
    addM2TargetAndAutoLink('Continuum', 'This is a summary of the science idea.');

    clickStatusIconNav('statusId7'); //Click to data product page
    pageConfirmed('DATA PRODUCT');
    cy.get('[data-testid="statusId7"]').should('have.attr', 'aria-label').and('include', 'OK');

    // AutoLinking sets a freshly auto-linked Continuum data product's polarisations to
    // POLARISATIONS_DEFAULT (['I']) - deselect it to reach the zero-polarisations state
    // BTN-3269 made reachable.
    cy.get('[data-testid="polarisationsI"]').click();

    cy.get('[data-testid="statusId7"]').should('have.attr', 'aria-label').and('include', 'Error');
  });
});
