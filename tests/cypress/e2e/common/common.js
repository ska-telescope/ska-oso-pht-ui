import {
  click,
  entry,
  get,
  selectId,
  selectValue,
  verifyContent,
  verifyExists,
  verifyVisible,
  viewPort
} from '../../fixtures/utils/cypress';

export const initialize = () => {
  viewPort();
  cy.visit('/');
};

// Stubbed API calls
// see: https://docs.cypress.io/app/guides/network-requests#Routing

// TODO move cy. commands out of this file into cypress.js and create a function for it
export const getProposals = () => {
  cy.fixture('proposals.json').then(proposals => {
    cy.intercept('GET', '**/pht/prsls/list/DefaultUser', {
      statusCode: 200,
      body: proposals
    }).as('getProposals');
  });
};

// TODO move cy. commands out of this file into cypress.js and create a function for it
export const verifyMockedAPICall = stubAlias => {
  cy.wait(stubAlias).then(interception => {
    assert.isNotNull(interception.response.body, 'API call has data');
  });
};

/*----------------------------------------------------------------------*/

export const clickButton = testId => {
  verifyExists(testId);
  verifyVisible(testId);
  click(testId);
};

export const clickAddButton = () => clickButton('addButton');
export const clickAddDataProduct = () => clickButton('addDataProductButton');
export const clickAddObservation = () => clickButton('addObservationButton');
export const clickAddPanel = () => clickButton('plusIcon');
export const clickAddPanelEntry = () => clickButton('addPanelButton');
export const clickAddProposal = () => clickButton('addProposalButton');
export const clickCreateProposal = () => clickButton('nextButtonTestId');
export const clickHome = () => clickButton('homeButtonTestId');
export const clickLoginUser = () => clickButton('usernameMenu');
export const clickObservationSetup = () => clickButton('addObservationButton');
export const clickPanelMaintenanceButton = () => clickButton('pmtBackButton');
export const clickResolveButton = () => clickButton('resolveButton');
export const clickReviewOverviewButton = () => clickButton('overviewButtonTestId');
export const clickSave = () => clickButton('saveButtonTestId');
export const clickSendInviteButton = () => clickButton('sendInviteButton');
export const clickToAddTarget = () => clickButton('addTargetButton');
export const clickToConfirmProposalSubmission = () => clickButton('displayConfirmationButton');
export const clickToNextPage = () => clickButton('nextButtonTestId');
export const clickToPreviousPage = () => clickButton('prevButtonTestId');

/*----------------------------------------------------------------------*/

export const clickDropdown = (testId, value) => {
  verifyExists(testId);
  click(testId);
  selectValue(value);
};

export const checkFieldDisabled = (testId, disabled) => {
  if (disabled) {
    cy.get('[data-testid="' + testId + '"]').should('not.be.enabled');
  } else {
    cy.get('[data-testid="' + testId + '"]').should('not.be.disabled');
  }
};
/*----------------------------------------------------------------------*/

export const clickNav = (testId, title) => {
  click(testId);
  if (title.length) {
    verifyContent('pageTitle', title);
  }
};
export const clickNavId = (testId, title) => {
  cy.get('#{' + testId + '} > .MuiButtonBase-root');
  if (title.length) {
    verifyContent('pageTitle', title);
  }
};
export const clickPanelButtonPanels = () => clickNavId('Panel Maintenance', 'Panel Maintenance');
export const clickPanelButtonReviews = () => clickNavId('REVIEW PROPOSALS', 'REVIEW PROPOSALS');
export const clickPanelButtonProposals = () => clickNavId('panelBtn3', '');
export const clickFirstPanel = () =>
  get('dataGridId')
    .find('.MuiDataGrid-row')
    .first()
    .click();

export const clickPanelProposalsTab = () => selectId('simple-tab-1');

export const enterPanelName = uniqueName => entry('panelName', uniqueName || 'Panel Name');

export const verifyPanelCreatedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Panel added with unique identifier');

export const verifyPanelOnGridIsVisible = PanelName => {
  verifyContent('dataGridId', PanelName);
};

export const verifyReviewerOnGridIsVisible = ReviewerName => {
  verifyContent('dataGridReviewers', ReviewerName);
};
export const verifyProposalOnGridIsVisible = ProposalName => {
  verifyContent('dataGridProposals', ProposalName);
};

/*----------------------------------------------------------------------*/

export const clickUserMenu = (testId, title) => {
  clickLoginUser();
  clickNav(testId, title);
};
export const clickUserMenuOverview = () => clickUserMenu('menuItemOverview', 'OVERVIEW');
export const clickUserMenuProposals = () => clickUserMenu('menuItemProposals', '');
export const clickUserMenuVerification = () => clickUserMenu('menuItemVerification', '');
export const clickUserMenuPanels = () => clickUserMenu('menuItemPanelSummary', 'PANEL MAINTENANCE');
export const clickUserMenuReviews = () => clickUserMenu('menuItemReviews', 'REVIEW PROPOSALS');
export const clickUserMenuLogout = () => click('menuItemLogout');

/*----------------------------------------------------------------------*/

export const pageConfirmed = label => cy.get('#pageTitle').contains(label);
export const verifyOnLandingPage = () => verifyExists('addProposalButton');

/*----------------------------------------------------------------------*/

export const enterProposalTitle = () => entry('titleId', 'Proposal Title');

export const selectCosmology = () => clickDropdown('categoryId', '1');

export const clickProposalTypePrincipleInvestigator = () => selectId('ProposalType-1');
export const clickSubProposalTypeTargetOfOpportunity = () => selectId('proposalAttribute-1');

export const verifyProposalCreatedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Proposal added with unique identifier');

export const clickEditProposal = () => {
  get('EditRoundedIcon')
    .eq(0)
    .click();
};

export const validateProposal = () => {
  clickToValidateProposal();
};

export const verifyProposalIsValid = () => {
  verifyProposalValidAlertFooter();
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

export const clickToTeamPage = () => {
  clickToNextPage();
  pageConfirmed('TEAM');
};

export const addTeamMember = () => {
  entry('firstName', 'Test');
  entry('lastName', 'User');
  entry('email', 'TestUser@test.com');
  clickSendInviteButton();
};

export const verifyEmailSentAlertFooter = () => {
  // TODO : DISABLED : Will fix once migration to Vite has been completed
  // get('timeAlertFooter').should('include.text', 'Email invite has been sent.');
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

export const verifySensitivityCalculatorStatusSuccess = () => {
  cy.get('[data-testid="statusId"]').should('exist');
  cy.get('[aria-label="Status : OK "]').should('exist');
};

export const addObservatoryDataProduct = () => {
  pageConfirmed('DATA PRODUCT');
  cy.get('[id="observations"]').type('{enter}');
  cy.get('[data-testid="observatoryDataProduct1"]').click();
  cy.get('[id="imageSize"]').type('1');
  clickAddButton();
};

export const addAbstract = () => {
  cy.get('[id="abstractId"]').should('exist');
  cy.get('[id="abstractId"]').type('Test abstract');
};

export const addM2TargetUsingResolve = () => {
  cy.get('[id="name"]').should('exist');
  cy.get('[id="name"]').type('M2');
  clickResolveButton();
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
    .should('contain', 'obs-');
  //  .should('contain', 'AA4');
  //  .should('have.length', 2);
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
  get('timeAlertFooter').should('include.text', 'Proposal is Valid');
};

export const clickToSubmitProposal = () => {
  cy.get('[data-testid="submitBtnTestId"]').should('exist');
  cy.get('[data-testid="submitBtnTestId"]').click();
};

export const verifyFirstProposalOnLandingPageHasSubmittedStatus = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .eq(0)
    .children('div[role="row"]')
    .should('contain', 'prsl-t0001-')
    .should('contain', 'Proposal Title')
    .should('contain', 'Submitted');
};
