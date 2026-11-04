import { initializeUserNotLoggedIn, clearLocalStorage, button } from '../../support/common';

describe('Guest User', () => {
  beforeEach(() => {
    initializeUserNotLoggedIn();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate user has not yet signed in, log in button is present', () => {
    button('Sign In').should('be.visible');
  });

  it('Verify a guest user can use the external link to the sensitivity calculator application', () => {
    //verify not logged in - the landing page prompts the guest to sign in
    button('Register / Sign in').should('be.visible');

    //stub window.open to verify the correct URL is being opened
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    button('Open Sensitivity Calculator').click();

    cy.get('@windowOpen').should('have.been.called');

    cy.get('@windowOpen').should(
      'have.been.calledWith',
      'https://sensitivity-calculator.skao.int/'
    );
  });
});
