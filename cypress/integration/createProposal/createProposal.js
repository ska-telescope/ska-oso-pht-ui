import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';

Given('I am a PHT user who wants to create a proposal', () => {
  clickAddProposal()
});

When('I provide a title and select the proposal category', () => {
  cy.get('[id="titleId"]').type("Proposal Title");
  cy.get('[id="ProposalType-1"]').click({ force: true });
  cy.get('[aria-label="A target of opportunity observing proposal"]').click();
  clickCreateProposal()
});

Then('a proposal with unique ID is created and I can see that on the landing page', () => {
  clickSaveProposal()
  clickHome()
  verifyProposalOnLandingPage()
});

const pageConfirmed = label => {
  cy.get('#pageTitle').contains(label);
};

const clickAddProposal = () => {
  cy.get('[data-testid="addProposalButton"]').should('exist');
  cy.get('[data-testid="addProposalButton"]').click();
  cy.get('[id="titleId"]').should('be.visible');
};

const clickCreateProposal = () => {
  cy.get('[data-testid="CreateButton"]').click();
  cy.get('[data-testid="timeAlertFooter"]').should('exist');
  pageConfirmed('TEAM');
};

const clickSaveProposal = () => {
  cy.get('[data-testid="saveButtonTestId"]').should('exist');
  cy.get('[data-testid="saveButtonTestId"]').click();
};

const clickHome = () => {
  cy.get('[data-testid="homeButtonTestId"]').should('exist');
  cy.get('[data-testid="homeButtonTestId"]').click();
};

const verifyProposalOnLandingPage = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .should('contain', 'prsl-t0001-')
    .should('contain', 'Cosmology')
    .should('contain', 'test')
    .should('have.length', 1);
};




