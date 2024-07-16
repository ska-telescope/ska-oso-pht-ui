describe('GIVEN that I am a PHT user', () => {
  context('WHEN I want to check the header', () => {
    beforeEach(() => {
      cy.visit('http://localhost:6101/');
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
