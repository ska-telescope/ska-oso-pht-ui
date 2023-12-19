context('REACT SKELETON', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8100/');
  });

  it('Header : Verify external link to skao site', () => {
    cy.get('[data-testid="skaoLogo"]').click();
  });

  it('Header : Verify light/dark mode is available', () => {
    cy.get('[data-testid="Brightness7Icon"]').click();
    cy.get('[data-testid="Brightness4Icon"]').should('be.visible');
    cy.get('[data-testid="Brightness4Icon"]').click();
    cy.get('[data-testid="Brightness7Icon"]').should('be.visible');
  });

  it('Footer : Verify Version', () => {
    cy.get('[data-testid="footerId"]')
      .contains('0.0.1')
      .should('be.visible');
  });
});
