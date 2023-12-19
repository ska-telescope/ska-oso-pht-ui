context('REACT SKELETON', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8090/');
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

  it('Footer : Verify Title and Telescope selector', () => {
    cy.get('[data-testid="footerId"]')
      .contains('1.0.0')
      .should('be.visible');
  });
  // Container testing

  it('Content : verify title', () => {
    cy.get('[data-testid="titleId"]').contains('Welcome');
  });

  it('Content : verify alert information panel', () => {
    cy.get('[data-testid="alertTestId"]').should('exist');
    cy.get('[data-testid="text1Id"]').contains(
      'This is a simple implementation of a REACT Application'
    );
    cy.get('[data-testid="text2Id"]').contains(
      'It is hoped that this is used as a basis for new applications for the SKAO'
    );
    cy.get('[data-testid="text3Id"]').contains(
      'A few basic components have been added as examples, as well as the MUI grid which can be used for component layout'
    );
    cy.get('[data-testid="text4Id"]').contains(
      'For information on the available gui-components, see the documentation available at this link'
    );
    cy.get('[data-testid="text5Id"]').contains(
      'https://developer.skao.int/projects/ska-gui-components/en/latest/?badge=latest'
    );
  });

  it('Content : verify sample data entry fields', () => {
    cy.get('[data-testid="textId"]').should('exist');
    cy.get('[data-testid="numberId"]').should('exist');
  });

  it('Content : verify alert card', () => {
    cy.get('[data-testid="languageId"]').contains('English');
    cy.get('[data-testid="statusId"]').should('exist');
    cy.get('[data-testid="dummyMessageId"]').contains('I am in ENGLISH translation file only');
  });
});
