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
  cy.get('[data-testid="titleId"]').type('Proposal Title');
};

export const selectCosmology = () => {
  cy.get('[data-testid="categoryId"]').click();
  cy.get('[data-value="1"]').click({ force: true });
};

export const clickProposalTypePrincipleInvestigator = () => {
  cy.get('[id="ProposalType-1"]').click({ force: true });
};

export const clickSubProposalTypeTargetOfOpportunity = () => {
  cy.get('[id="proposalAttribute-1"]').click({ force: true });
};

export const clickCreateProposal = () => {
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const verifyProposalCreatedAlertFooter = () => {
  cy.get("[data-testid='timeAlertFooter']").should(
    'contain.text',
    'Proposal added with unique identifier'
  );
};

export const clickEditProposal = () => {
  cy.get("[data-testid='EditRoundedIcon']")
    .eq(0)
    .click();
};

export const validateProposal = () => {
  clickToValidateProposal();
  verifyProposalValidAlertFooter();
};

export const pageConfirmed = label => {
  cy.get('#pageTitle').contains(label);
};

export const createStandardProposal = () => {
  clickAddProposal();
  enterProposalTitle();
  clickProposalTypePrincipleInvestigator();
  clickSubProposalTypeTargetOfOpportunity();
  clickCreateProposal();
  verifyProposalCreatedAlertFooter();
  pageConfirmed('TEAM');
};

export const clickHome = () => {
  cy.get('[data-testid="homeButtonTestId"]').should('exist');
  cy.get('[data-testid="homeButtonTestId"]').click();
};

export const clickSave = () => {
  cy.get('[data-testid="saveButtonTestId"]').should('exist');
  cy.get('[data-testid="saveButtonTestId"]').click();
};

export const clickToTeamPage = () => {
  clickToNextPage();
  pageConfirmed('TEAM');
};

export const addTeamMember = () => {
  cy.get('[data-testid="firstName"]').type('Test');
  cy.get('[data-testid="lastName"]').type('User');
  cy.get('[data-testid="email"]').type('TestUser@test.com');
  cy.get('[data-testid="sendInviteButton"]').click();
};

export const verifyEmailSentAlertFooter = () => {
  cy.get("[data-testid='timeAlertFooter']").should('include.text', 'Email invite has been sent.');
};

export const clickToGeneralPage = () => {
  clickToNextPage();
  pageConfirmed('GENERAL');
};

export const clickToSciencePage = () => {
  clickToNextPage();
  pageConfirmed('SCIENCE');
};

export const clickToTargetPage = () => {
  clickToNextPage();
  pageConfirmed('TARGET');
};

export const clickToObservationPage = () => {
  clickToNextPage();
  pageConfirmed('OBSERVATION');
};

export const clickToTechnicalPage = () => {
  clickToNextPage();
  pageConfirmed('TECHNICAL');
};

export const clickToObservatoryDataProductPage = () => {
  clickToNextPage();
  pageConfirmed('OBSERVATORY DATA PRODUCT');
};

export const clickToNextPage = () => {
  cy.get('[data-testid="nextButtonTestId"]').should('exist');
  cy.get('[data-testid="nextButtonTestId"]').click();
};

export const clickToPreviousPage = () => {
  cy.get('[data-testid="prevButtonTestId"]').should('exist');
  cy.get('[data-testid="prevButtonTestId"]').click();
};

export const clickAddDataProduct = () => {
  cy.get('[data-testid="addDataProductButton"]').click();
};

export const addObservatoryDataProduct = () => {
  pageConfirmed('DATA PRODUCT');
  cy.get('[id="observations"]').type('{enter}');
  cy.get('[data-testid="observatoryDataProduct1"]').click();
  cy.get('[id="imageSize"]').type('1');
  cy.get('[data-testid="addButton"]').click();
};

export const addAbstract = () => {
  cy.get('[id="abstractId"]').should('exist');
  cy.get('[id="abstractId"]').type('Test abstract');
};

export const addM2TargetUsingResolve = () => {
  cy.get('[id="name"]').should('exist');
  cy.get('[id="name"]').type('M2');
  cy.get('[data-testid="resolveButton"]').click();
};

export const clickToAddTarget = () => {
  cy.get('[data-testid="addTargetButton"]').should('exist');
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

export const verifyOnLandingPageFilterIsVisible = () => {
  cy.get('[data-testid="proposalType"]').should('exist');
  cy.get('[data-testid="proposalType"]').click();
  cy.get('[data-value="draft"]').click({ force: true });
};

export const verifyFirstProposalOnLandingPageIsVisible = () => {
  cy.get('[data-testid="dataGridId"]')
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

const clickToValidateProposal = () => {
  cy.get('[data-testid="validationBtnTestId"]').should('exist');
  cy.get('[data-testid="validationBtnTestId"]').click();
};

const verifyProposalValidAlertFooter = () => {
  cy.get("[data-testid='timeAlertFooter']").should('include.text', 'Proposal is Valid');
};

export const clickToSubmitProposal = () => {
  cy.get('[data-testid="submitBtnTestId"]').should('exist');
  cy.get('[data-testid="submitBtnTestId"]').click();
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
