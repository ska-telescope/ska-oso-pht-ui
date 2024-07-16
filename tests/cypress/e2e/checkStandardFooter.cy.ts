describe('GIVEN that I am a user on the main page of the PHT', () => {
  context('WHEN I want to check the header', () => {
    beforeEach(() => {
      cy.visit('http://localhost:6101/');
    });

    /*** Validate the page ****/
    const homePageConfirmed = () => {
      cy.get('[data-testid="addProposalButton"]').should('exist');
    };

    /**** TESTS ****/

    it('THEN I can check the link to the SKAO Site', () => {
      homePageConfirmed();
      cy.get('[data-testid="skaoLogo"]').click();
    });

    it('AND I can confirm that the light/dark mode works', () => {
      homePageConfirmed();
      cy.get('[data-testid="Brightness7Icon"]').click();
      cy.get('[data-testid="Brightness4Icon"]').should('be.visible');
      cy.get('[data-testid="Brightness4Icon"]').click();
      cy.get('[data-testid="Brightness7Icon"]').should('be.visible');
    });
  });
});
