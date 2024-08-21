export const clickAddProposal = () => {
  verifyAddProposalButtonExists();
  clickAddProposalButton();
};

export const clickAddProposalButton = () => {
  cy.get('[data-testid="addProposalButton"]').click();
};

export const verifyAddProposalButtonExists = () => {
  cy.get('[data-testid="addProposalButton"]').should('exist');
};

export const enterProposalTitle = () => {
  cy.get('[id="titleId"]').type('Proposal Title');
};

export const selectCosmology = () => {
  cy.get('[data-testid="categoryId"]').click();
  cy.get('[data-value="1"]').click({ force: true });
};

export const clickStandardProposalSubTypeTargetOfOpportunity = () => {
  cy.get('[id="ProposalType-1"]').click({ force: true });
  cy.get('[id="proposalAttribute-1"]').click({ force: true });
};

export const clickCreateProposal = () => {
  cy.get('[data-testid="CreateButton"]').click();
  verifyProposalCreatedAlertFooter();
};

export const verifyProposalCreatedAlertFooter = () => {
  cy.get('[data-testid="timeAlertFooter"]').should('include.text', 'Proposal added with unique identifier');
};

export const clickEditProposal = () => {
  cy.get("[data-testid='EditRoundedIcon']")
    .eq(0)
    .click();
};

export const pageConfirmed = label => {
  cy.get('#pageTitle').contains(label);
};

export const landingPageConfirmed = () => {
  verifyAddProposalButtonExists();
};

export const createStandardProposal = () => {
  clickAddProposalButton();
  pageConfirmed('TITLE');
  enterProposalTitle();
  clickStandardProposalSubTypeTargetOfOpportunity();
  clickCreateProposal();
  pageConfirmed('TEAM');
};

export const clickHome = () => {
  cy.get('[data-testid="homeButtonTestId"]').should('exist');
  cy.get('[data-testid="homeButtonTestId"]').click();
};

export const clickToTeamPage = () => {
  cy.get('[data-testid="TeamButton"]').should('exist');
  cy.get('[data-testid="TeamButton"]').click();
};

export const clickToGeneralPage = () => {
  cy.get('[data-testid="GeneralButton"]').should('exist');
  cy.get('[data-testid="GeneralButton"]').click();
};

export const clickToSciencePage = () => {
  cy.get('[data-testid="ScienceButton"]').should('exist');
  cy.get('[data-testid="ScienceButton"]').click();
};

export const clickToTargetPage = () => {
  cy.get('[data-testid="TargetButton"]').should('exist');
  cy.get('[data-testid="TargetButton"]').click();
};

export const clickToObservationPage = () => {
  cy.get('[data-testid="ObservationButton"]').should('exist');
  cy.get('[data-testid="ObservationButton"]').click();
};

export const clickToTechnicalPage = () => {
  cy.get('[data-testid="TechnicalButton"]').should('exist');
  cy.get('[data-testid="TechnicalButton"]').click();
};

export const clickToObservatoryDataProductPage = () => {
  cy.get('[data-testid="Observatory Data ProductButton"]').should('exist');
  cy.get('[data-testid="Observatory Data ProductButton"]').click();
};

export const addAbstract = () => {
  cy.get('[id="abstractId"]').should('exist');
  cy.get('[id="abstractId"]').type('Test abstract');
};

export const addM1TargetUsingResolve = () => {
  cy.get('[id="name"]').should('exist');
  cy.get('[id="name"]').type('M1');
  cy.get('[data-testid="resolveButton"]').click();
};

export const clickToAddTarget = () => {
  cy.get('[data-testid="addTargetButton"]').click();
};

export const clickObservationSetup = () => {
  cy.get('[data-testid="addObservationButton"]').click();
};

export const clickAddObservation = () => {
  cy.get('[data-testid="addObservationButton"]').click();
};

export const verifyOnLandingPage = () => {
  cy.get('[data-testid="addProposalButton"]').should('exist');
};

export const verifyFirstProposalOnLandingPageIsVisible = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .eq(0)
    .children('div[role="row"]')
    .should('contain', 'prsl-t0001-')
    .should('contain', 'Proposal Title');
};

export const verifyObservationInTable = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .should('contain', 'obs-')
    .should('contain', 'AA4')
    .should('have.length', 2);
};

export const clickObservationFromTable = () => {
  cy.get('[data-rowindex="0"]').click({ multiple: true });
};
export const clickToLinkTargetAndObservation = () => {
  cy.get('[data-testid="linkedTickBox"]').click();
};

export const clickToValidateProposal = () => {
  cy.get('[data-testid="ValidationTestId"]').should('exist');
  cy.get('[data-testid="ValidationTestId"]').click();
};

export const verifyProposalValidAlertFooter = () => {
  cy.get('[data-testid="timeAlertFooter"]').should('include.text', 'Proposal is Valid');
};

export const clickToSubmitProposal = () => {
  cy.get('[data-testid="SubmitTestId"]').should('exist');
  cy.get('[data-testid="SubmitTestId"]').click();
};

export const clickToConfirmProposalSubmission = () => {
  cy.get('[data-testid="displayConfirmationButton"]').should('exist');
  cy.get('[data-testid="displayConfirmationButton"]').click();
};

export const verifyFirstProposalOnLandingPageHasSubmittedStatus = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .eq(0)
    .children('div[role="row"]')
    .should('contain', 'prsl-t0001-')
    .should('contain', 'Proposal Title')
    .should('contain', 'Submitted');
};
