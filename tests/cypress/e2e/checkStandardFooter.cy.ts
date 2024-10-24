describe('GIVEN that I am a user on the main page of the PHT', () => {
  context('WHEN I want to check the footer', () => {
    beforeEach(() => {
      cy.viewport(2000, 2000);
      cy.visit('/');
      cy.get('[data-testid="skaoLogo"]', { timeout: 30000 });
    });

    it('THEN I can check the version details', () => {
      cy.get('[data-testid="footerId"]')
        .contains('0.3.1')
        .should('be.visible');
    });
  });
});
