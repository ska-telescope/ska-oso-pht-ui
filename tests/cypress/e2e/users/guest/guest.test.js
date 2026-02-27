import {
  initializeUserNotLoggedIn,
  clearLocalStorage,
  verify,
  verifyInformationBannerText
} from '../../common/common';

describe('Guest User', () => {
  beforeEach(() => {
    initializeUserNotLoggedIn();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate user has not yet signed in, log in button is present', () => {
    verify('loginButton');
  });

  it('Verify a guest user can use the external link to the sensitivity calculator application', () => {
    //verify not logged in information banner
    verifyInformationBannerText('NOT LOGGED IN, NO SUBMISSIONS AVAILABLE');

    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.get('[data-testId="SensCalcButtonTestId"]').click();

    cy.get('@windowOpen').should('have.been.called');

    cy.get('@windowOpen').should(
      'have.been.calledWith',
      'https://sensitivity-calculator.skao.int/'
    );
  });
});
