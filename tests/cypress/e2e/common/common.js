import {
  click,
  entry,
  get,
  selectId,
  selectValue,
  verifyContent,
  verifyExists,
  verifyVisible,
  getCheckboxInRow,
  viewPort
} from '../../fixtures/utils/cypress';
export const initialize = user => {
  viewPort();
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.setItem('cypress:group', user.group);
      win.localStorage.setItem('cypress:token', user.token);
      win.localStorage.setItem('cypress:account', JSON.stringify(user));
    }
  });
};

export const initializeUserNotLoggedIn = () => {
  viewPort();
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.setItem('proposal:noLogin', 'true');
    }
  });
};

export const clearLocalStorage = () => {
  cy.window().then(win => {
    win.localStorage.clear();
  });
};

// Stubbed API calls
// see: https://docs.cypress.io/app/guides/network-requests#Routing

// TODO move cy. commands out of this file into cypress.js and create a function for it
export const getProposals = () => {
  cy.fixture('proposals.json').then(proposals => {
    cy.intercept('GET', '**/pht/prsls/mine', {
      statusCode: 200,
      body: proposals
    }).as('getProposals');
  });
};

// TODO move cy. commands out of this file into cypress.js and create a function for it
export const getSubmittedProposals = () => {
  cy.fixture('proposals.json').then(proposals => {
    cy.intercept('GET', '**/pht/prsls/submitted', {
      statusCode: 200,
      body: proposals
    }).as('getSubmittedProposals');
  });
};

// TODO move cy. commands out of this file into cypress.js and create a function for it
export const getReviewers = () => {
  cy.fixture('reviewers.json').then(reviewers => {
    cy.intercept('GET', '**/pht/reviewers', {
      statusCode: 200,
      body: reviewers
    }).as('getReviewers');
  });
};

// TODO move cy. commands out of this file into cypress.js and create a function for it
export const verifyMockedAPICall = stubAlias => {
  cy.wait(stubAlias).then(interception => {
    assert.isNotNull(interception.response.body, 'API call has data');
  });
};

export const mockCreateSubmissionAPI = () => {
  cy.window().then(win => {
    const token = win.localStorage.getItem('cypress:token');
    cy.fixture('proposal.json').then(proposal => {
      cy.intercept('POST', '**/pht/prsls/create', req => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: proposal
        });
      }).as('mockCreateSubmission');
    });
  });
};

export const mockGetUserByEmailAPI = () => {
  cy.window().then(win => {
    const token = win.localStorage.getItem('cypress:token');
    cy.fixture('userMSGraph.json').then(user => {
      cy.intercept('GET', '**/pht/prsls/member/Trevor.Swain@community.skao.int', req => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: user
        });
      }).as('mockgetUserByEmailAPI');
    });
  });
};

export const mockEmailAPI = () => {
  cy.window().then(win => {
    const token = win.localStorage.getItem('cypress:token');
    cy.intercept('POST', '**/pht/prsls/send-email/', req => {
      req.headers['Authorization'] = `Bearer ${token}`;
      req.reply({
        statusCode: 200,
        body: { message: 'Email sent successfully' }
      });
    }).as('mockInviteUserByEmail');
  });
};

export const mockResolveTargetAPI = () => {
  cy.fixture('target.json').then(target => {
    cy.intercept('GET', '**/coordinates/M2/equatorial', {
      statusCode: 200,
      body: target
    }).as('mockResolveTarget');
  });
};

export const mockOSDAPI = () => {
  cy.fixture('osd.json').then(osdData => {
    cy.intercept('GET', '**/osd/10000', {
      statusCode: 200,
      body: osdData
    }).as('mockOSDData');
  });
};

/*----------------------------------------------------------------------*/

export const verify = testId => {
  verifyExists(testId);
  verifyVisible(testId);
};

export const clickButton = testId => {
  verify(testId);
  click(testId);
};

export const clickAddButton = () => clickButton('addButton');
export const clickAddDataProduct = () => clickButton('addDataProductButton');
export const clickUserSearch = () => clickButton('userSearchButton');
export const clickManageTeamMemberRights = () => clickButton('lockIcon');
export const clickSubmitRights = () => clickButton('submitCheckbox');
export const clickPICheckbox = () => clickButton('piCheckbox');
export const clickAddSubmission = () => clickButton('addSubmissionButton');
export const clickCreateSubmission = () => clickButton('nextButtonTestId');
export const clickHome = () => clickButton('homeButtonTestId');
export const clickDialogConfirm = () => clickButton('dialogConfirmationButton');
export const clickLoginUser = () => clickButton('loginButton');
export const clickCycleConfirm = () => clickButton('cycleConfirmationButton');
export const clickUserMenu = () => clickButton('usernameMenu');
export const clickObservationSetup = () => clickButton('addObservationButton');
export const clickAddObservationEntry = () => clickButton('addObservationButtonEntry');
export const clickPanelManagementButton = () => clickButton('pmtBackButton');
export const clickResolveButton = () => clickButton('resolveButton');
export const clickReviewOverviewButton = () => clickButton('overviewButtonTestId');
export const clickSave = () => clickButton('saveBtn');
export const clickSendInviteButton = () => clickButton('sendInviteButton');
export const clickToAddTarget = () => clickButton('addTargetButton');
export const clickCycleSelectionMockProposal = () => clickButton('CYCLE-003_ID');
export const clickCycleSelectionSV = () => clickButton('SKAO_2027_1_ID');
export const clickToAddDataProduct = () => clickButton('addDataProductButton');
export const clickToConfirmProposalSubmission = () => clickButton('displayConfirmationButton');
export const clickToNextPage = () => clickButton('nextButtonTestId');
export const clickToPreviousPage = () => clickButton('prevButtonTestId');

export const clickToLinkTargetObservation = () => clickButton('linkedTickBox');

export const clickStatusIconNav = testId => {
  cy.get('[data-testid="' + testId + '"]')
    .eq(0)
    .click();
};

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

export const checkStatusIndicatorDisabled = (testId, disabled) => {
  if (disabled) {
    cy.get('[data-testid="' + testId + '"]')
      .closest('button')
      .should('be.disabled');
  } else {
    cy.get('[data-testid="' + testId + '"]')
      .closest('button')
      .should('be.enabled');
  }
};

export const verifyStatusIndicatorLabel = (testId, label) => {
  cy.get('[data-testid="' + testId + '"]')
    .closest('button')
    .contains(label);
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
export const clickFirstPanel = () =>
  get('dataGridId')
    .find('.MuiDataGrid-row')
    .first()
    .click();

export const clickPanelProposalsTab = () => selectId('simple-tab-1');

export const verifyPanelOnGridIsVisible = PanelName => {
  verifyContent('dataGridId', PanelName);
};

export const verifyReviewerOnGridIsVisible = ReviewerName => {
  verifyContent('dataGridReviewers', ReviewerName);
};
export const verifyProposalOnGridIsVisible = ProposalName => {
  verifyContent('dataGridProposals', ProposalName);
};

export const clickLinkedTickedBox = index => {
  getCheckboxInRow(index).click({ force: true });
};

export const verifyTickBoxIsSelected = index => {
  getCheckboxInRow(index).should('be.checked');
};

/*----------------------------------------------------------------------*/

export const clickSignINBtns = (testId, title) => {
  clickUserMenu();
  clickNav(testId, title);
};
export const clickUserMenuOverview = () => clickSignINBtns('menuItemOverview', 'OVERVIEW');
export const clickUserMenuProposals = () => clickSignINBtns('menuItemProposals', '');
export const clickUserMenuVerification = () => clickSignINBtns('menuItemVerification', '');
export const clickUserMenuPanels = () =>
  clickSignINBtns('menuItemPanelSummary', 'PANEL MANAGEMENT');
export const clickUserMenuReviews = () => clickSignINBtns('menuItemReviews', 'REVIEW PROPOSALS');
export const clickUserMenuDecisions = () =>
  clickSignINBtns('menuItemReviewDecisions', 'REVIEW DECISIONS');
export const clickUserMenuLogout = () => click('menuItemLogout');
export const clickListOfTargets = () => cy.get('#listOfTargets').click();

/*----------------------------------------------------------------------*/

function verifyUserMenu(testId, shouldExist) {
  const selector = `[data-testid="${testId}"]`;

  if (shouldExist) {
    cy.get(selector)
      .should('exist')
      .and('be.visible');
  } else {
    cy.get('body').then($body => {
      if ($body.find(selector).length > 0) {
        cy.get(selector).should('not.be.visible');
      } else {
        cy.log(`Menu item "${testId}" not found, as expected`);
      }
    });
  }
}
export const verifyUserMenuOverview = exists => verifyUserMenu('menuItemOverview', exists);
export const verifyUserMenuProposals = exists => verifyUserMenu('menuItemProposals', exists);
export const verifyUserMenuVerification = exists => verifyUserMenu('menuItemVerification', exists);
export const verifyUserMenuPanels = exists => verifyUserMenu('menuItemPanelSummary', exists);
export const verifyUserMenuReviews = exists => verifyUserMenu('menuItemReviews', exists);
export const verifyUserMenuDecisions = exists => verifyUserMenu('menuItemReviewDecisions', exists);

/*----------------------------------------------------------------------*/

export const pageConfirmed = label => cy.get('#pageTitle').contains(label);
export const verifyOnLandingPage = () => verifyExists('addSubmissionButton');

export const clickConfirmButtonWithinPopup = () => {
  cy.get('[role="dialog"]')
    .eq(1)
    .within(() => {
      cy.get('[data-testid="dialogConfirmationButton"]').click();
    });
};

/*----------------------------------------------------------------------*/

export const enterProposalTitle = () => entry('titleId', 'Proposal Title');
export const enterScienceVerificationIdeaTitle = () =>
  entry('titleId', 'Science Verification Idea Title');

export const selectContinuum = () => clickDropdown('categoryId', '102');

export const selectCosmology = () => clickDropdown('categoryId', '1');
export const selectObservingMode = value => {
  cy.get('[data-testid="categoryId"]').should('exist');
  cy.get('[data-testid="categoryId"]').click();
  cy.get('li[data-value="' + value + '"]').click();
};

export const clickProposalTypePrincipleInvestigator = () => selectId('ProposalType-1');
export const clickSubProposalTypeTargetOfOpportunity = () => selectId('proposalAttribute-1');

export const verifyOsdDataCycleID = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(osdData.observatory_policy.cycle_information.cycle_id).to.equal(data);
  });
};

export const verifyOsdDataCycleDescription = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(osdData.observatory_policy.cycle_description).to.equal(data);
  });
};

export const verifyOsdDataProposalOpen = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(osdData.observatory_policy.cycle_information.proposal_open).to.equal(data);
    verifyContent('SKAO_2027_1_opens', '27-03-2026');
  });
};

export const verifyOsdDataProposalClose = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(osdData.observatory_policy.cycle_information.proposal_close).to.equal(data);
    verifyContent('SKAO_2027_1_closes', '12-05-2026');
  });
};

export const verifyOsdDataMaxTargets = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(osdData.observatory_policy.cycle_policies.max_targets).to.equal(data);
  });
};

export const verifyScienceIdeaCreatedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Science Verification Idea added with unique identifier');

export const verifySubmissionCreatedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Submission added with unique identifier');

export const verifyInformationBannerText = text => {
  cy.get('[data-testId="borderedSection"]').contains(text);
};

export const verifyUserFoundAlertFooter = () =>
  verifyContent('timeAlertFooter', 'User was successfully found.');

export const verifyUserInvitedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Email invite has been sent.');

export const verifyTeamMemberAccessUpdatedAlertFooter = () =>
  verifyContent('timeAlertFooter', "Team member's access has been updated.", 30000);

export const clickEdit = () => {
  cy.get('[data-testId="EditRoundedIcon"]').should('be.visible');
  cy.get('[data-testId="EditRoundedIcon"]').click();
};
export const tabToEditTarget = () => {
  cy.press('Tab');
  cy.focused().click(); //click edit target
};

export const validateProposal = () => {
  clickToValidateProposal();
};

export const verifyProposalIsValid = () => {
  verifyProposalValidAlertFooter();
};

export const createStandardProposal = () => {
  clickAddSubmission();
  enterProposalTitle();
  // clickProposalTypePrincipleInvestigator();
  // clickSubProposalTypeTargetOfOpportunity();
  clickCreateSubmission();
  verifySubmissionCreatedAlertFooter();
  pageConfirmed('TEAM');
};

export const createMock = () => {
  clickAddSubmission();
  clickCycleSelectionSV();
  clickCycleConfirm();
  pageConfirmed('TARGET');
};

export const createStandardProposalLoggedIn = () => {
  clickAddSubmission();
  clickCycleConfirm();
  enterProposalTitle();
  clickProposalTypePrincipleInvestigator();
  clickSubProposalTypeTargetOfOpportunity();
  clickCreateSubmission();
};

export const createScienceIdeaLoggedIn = () => {
  clickAddSubmission();
  clickCycleSelectionSV();
  clickCycleConfirm();
  enterScienceVerificationIdeaTitle();
  clickCreateSubmission();
};

export const clickToTeamPage = () => {
  clickToNextPage();
  pageConfirmed('TEAM');
};

export const addInvestigator = () => {
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

export const clickToCalibrationPage = () => {
  clickToNextPage();
  pageConfirmed('CALIBRATION');
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
  cy.get('[data-testid="name"]').should('exist');
  cy.get('[data-testid="name"]').type('M2');
  clickResolveButton();
};

export const updateDataProductField = (testId, value) => {
  cy.get('[data-testid="' + testId + '"]').should('exist');
  cy.get('[data-testid="' + testId + '"]').type(value);
};

export const enterTargetField = (testId, value) => {
  cy.get('[data-testid="' + testId + '"]').should('exist');
  cy.get('[data-testid="' + testId + '"]').type(value);
};

export const updateTargetField = (testId, value) => {
  cy.get('[data-testid="' + testId + '"]').should('exist');
  cy.get('[data-testid="' + testId + '"]')
    .eq(1)
    .clear()
    .type(value);
};

export const verifyOnLandingPageFilterIsVisible = () => {
  cy.get('[data-testid="proposalType"]').should('exist');
  cy.get('[data-testid="proposalType"]').realClick();
  cy.get('[data-value="draft"]').realClick();
};

export const verifyMockedProposalOnLandingPageIsVisible = () => {
  cy.get('[data-testid="table-submissions"]').should('contain', 'prsl-test');
};

export const verifyOnLandingPageNoProposalMsgIsVisible = () => {
  cy.get('[id="standardAlertId"]').should('contain', 'THERE ARE NO PROPOSALS TO BE DISPLAYED');
};

export const verifyOnLandingPageNotLoggedInMsgIsVisible = () => {
  cy.get('[id="standardAlertId"]').should('contain', 'NOT LOGGED IN, NO PROPOSALS AVAILABLE');
};

export const verifyObservationInTable = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .should('contain', 'obs-');
  //  .should('contain', 'AA2');
  //  .should('have.length', 2);
};

export const verifyFieldError = (testId, error, exists) => {
  cy.get('[data-testid="' + testId + '"]').should('exist');
  if (exists) {
    cy.get('[data-testid="' + testId + '"]').should('contain', error);
  } else {
    cy.get('[data-testid="' + testId + '"]').should('not.contain', error);
  }
};

export const clickObservationFromTable = () => {
  cy.get('[data-rowindex="0"]').click({ multiple: true });
};
export const clickToLinkTargetAndObservation = () => {
  cy.get('[data-testid="linkedTickBox"]').click({ multiple: true });
};
export const verifyTargetInTargetTable = (targetName, ra, dec, velocity) => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .eq(0)
    .within(() => {
      cy.get('[data-field="name"]').should('contain', targetName);
      cy.get('[data-field="raStr"]').should('contain', ra);
      cy.get('[data-field="decStr"]').should('contain', dec);
      cy.get('[data-field="vel"]').should('contain', velocity);
    });
};

export const clickFirstRowOfTargetTable = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .eq(0)
    .within(() => {
      cy.get('[data-field="actions"]').should('be.visible');
    });
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .eq(0)
    .click();
};

const clickToValidateProposal = () => {
  cy.get('[data-testid="validateBtn"]').should('exist');
  cy.get('[data-testid="validateBtn"]').click();
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

export const verifyHomeButtonWarningModal = () => {
  cy.get('#alert-dialog-proposal-change .MuiDialogContent-root').should(
    'contain',
    'You are not logged in'
  );
};

export const verifyUnlinkedObservationInTable = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .should('contain', 'obs-')
    .should('contain', 'AA2')
    .should('have.length', 1);
};

export const clickUnlinkedObservationInTable = () => {
  cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    .children('div[role="row"]')
    .should('contain', 'obs-')
    .should('contain', 'AA2')
    .click({ multiple: true });
};

export const verifySensCalcStatus = () => {
  cy.get('[data-testid="statusId"]')
    .should('be.visible')
    .invoke('attr', 'aria-label')
    .should('include', 'Status : OK');
};

export const createObservation = () => {
  //add default observation
  clickObservationSetup();
  clickAddObservationEntry();
};
