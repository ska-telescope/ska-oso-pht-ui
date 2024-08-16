describe('GIVEN that I am a PHT user', () => {
  context('WHEN I want to check the header', () => {
    beforeEach(() => {
      cy.viewport(2000, 2000);
      cy.visit('http://localhost:6101/');
      cy.get('[data-testid="skaoLogo"]', { timeout: 30000 });
    });

    it('THEN I can check the link to the SKAO Site', () => {
      cy.get('[data-testid="skaoLogo"]').click();
    });

    it('AND I can confirm that the light/dark mode works', () => {
      cy.get('[data-testid="Brightness7Icon"]').click();
      cy.get('[data-testid="Brightness4Icon"]').should('be.visible');
      cy.get('[data-testid="Brightness4Icon"]').click();
      cy.get('[data-testid="Brightness7Icon"]').should('be.visible');
    });
  });
});
