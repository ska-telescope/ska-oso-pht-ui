import {
  click,
  entry,
  get,
  selectId,
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

// IMPROVEMENT  move cy. commands out of this file into cypress.js and create a function for it

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

export const mockCreateProposalAPI = () => {
  cy.window().then(win => {
    const token = win.localStorage.getItem('cypress:token');
    cy.fixture('proposal.json').then(submission => {
      cy.intercept('POST', '**/pht/prsls/create', req => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: submission
        });
      }).as('mockCreateProposal');
    });
  });
};

export const mockCreateSVIdeaAPI = () => {
  cy.window().then(win => {
    const token = win.localStorage.getItem('cypress:token');
    cy.fixture('svIdea.json').then(submission => {
      cy.intercept('POST', '**/pht/prsls/create', req => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: submission
        });
      }).as('mockCreateSVIdea');
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
      }).as('mockGetUserByEmailAPI');
    });
  });
};

export const mockCreateProposalAccessAPI = () => {
  cy.window().then(win => {
    const token = win.localStorage.getItem('cypress:token');
    cy.intercept('POST', '**/pht/proposal-access/create', req => {
      req.headers['Authorization'] = `Bearer ${token}`;
      req.reply({
        statusCode: 200,
        body: { message: 'prslacc-ddfdbe-733d6b8' }
      });
    }).as('mockCreateProposalAccessAPI');
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
    cy.intercept('GET', '**/osd/cycles', {
      statusCode: 200,
      body: osdData
    }).as('mockOSDData');
  });
};

export const mockValidateAPI = () => {
  cy.window().then(win => {
    const token = win.localStorage.getItem('cypress:token');
    cy.intercept('POST', '**/pht/prsls/validate', req => {
      req.headers['Authorization'] = `Bearer ${token}`;
      req.reply({
        statusCode: 200,
        body: { result: true, validation_errors: [] }
      });
    }).as('mockValidate');
  });
};

export const mockValidateSVIdeaAPI = () => {
  cy.window().then(win => {
    const token = win.localStorage.getItem('cypress:token');
    cy.fixture('validateSVIdea.json').then(submission => {
      cy.intercept('POST', '**/pht/prsls/validate', req => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: { result: true, validation_errors: [] }
        });
      }).as('mockValidateSVIdea');
    });
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

export const clickAddDataProduct = () => clickButton('addDataProductButton');
export const clickAddDataProductEntry = () => clickButton('addDataProductButtonEntry');
export const clickUserSearch = () => clickButton('userSearchButton');
export const clickSubmitRights = () => clickButton('submitCheckbox');
export const clickAddSubmission = () => clickButton('addSubmissionButton');
export const clickCreateSubmission = () => clickButton('nextButtonTestId');
export const clickHome = () => clickButton('homeButtonTestId');
export const clickDialogConfirm = () => clickButton('dialogConfirmationButton');
export const clickCycleConfirm = () => clickButton('cycleConfirmationButton');
export const clickUserMenu = () => clickButton('usernameMenu');
export const clickObservationSetup = () => clickButton('addObservationButton');
export const clickAddObservationEntry = () => clickButton('addObservationButtonEntry');
export const clickResolveButton = () => clickButton('resolveButton');
export const clickSendInviteButton = () => clickButton('sendInviteButton');
export const clickToAddTarget = () => clickButton('addTargetButton');
export const clickCycleSelectionMockProposal = () => clickButton('CYCLE-003_ID');
export const clickCycleSelectionSV = () => clickButton('SKAO_2027_1_ID');
export const clickToConfirmProposalSubmission = () => clickButton('displayConfirmationButton');
export const clickToNextPage = () => clickButton('nextButtonTestId');
export const clickFileUploadArea = () => clickButton('fileUpload');
export const clickFileUpload = () => clickButton('fileUploadUploadButton');
export const clickRank9 = () => clickButton('Rank9');
export const clickFeasibilityYes = () => clickButton('FeasibilityYes');
export const clickStatusIconNav = testId => {
  cy.get('[data-testid="' + testId + '"]')
    .eq(0)
    .click();
};

/*----------------------------------------------------------------------*/

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

export const checkFieldIsVisible = (testId, visible) => {
  if (visible) {
    cy.get('[data-testid="' + testId + '"]')
      .closest('button')
      .should('be.visible');
  } else {
    cy.get('body')
      .find(`[data-testid="${testId}"]`)
      .should('not.exist');
  }
};
/*----------------------------------------------------------------------*/

export const uploadTestFile = fileName => {
  cy.get('[data-testid="fileUpload"] input[type="file"]').attachFile(fileName);
};

export const verifyTestFileUploaded = fileName => {
  cy.contains(fileName).should('be.visible');
};
export const clickNav = (testId, title) => {
  click(testId);
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
export const clickUserMenuPanels = () =>
  clickSignINBtns('menuItemPanelSummary', 'PANEL MANAGEMENT');
export const clickUserMenuReviews = () => clickSignINBtns('menuItemReviews', 'REVIEW PROPOSALS');
export const clickUserMenuDecisions = () =>
  clickSignINBtns('menuItemReviewDecisions', 'REVIEW DECISIONS');

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
export const verifyUserMenuPanels = exists => verifyUserMenu('menuItemPanelSummary', exists);
export const verifyUserMenuReviews = exists => verifyUserMenu('menuItemReviews', exists);
export const verifyUserMenuDecisions = exists => verifyUserMenu('menuItemReviewDecisions', exists);

/*----------------------------------------------------------------------*/

export const pageConfirmed = label => cy.get('#pageTitle').contains(label);
export const verifyOnLandingPage = () => verifyExists('addSubmissionButton');

export const clickConfirmButtonWithinPopup = () => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('[data-testid="displayConfirmationButton"]').click();
  });
};

export const clickGeneralCommentsTab = testId => {
  cy.get(`[data-testid="${testId}"]`).click({
    force: true
  });
};

/*----------------------------------------------------------------------*/

export const enterProposalTitle = () => entry('titleId', 'Proposal Title');
export const enterScienceVerificationIdeaTitle = () =>
  entry('titleId', 'Science Verification Idea Title');

export const selectObservingMode = value => {
  // Open the dropdown using mousedown instead of click
  cy.get('[data-testid="categoryId"] [role="combobox"]').trigger('mousedown', {
    button: 0,
    force: true
  });

  // Select the option
  cy.get('li[role="option"]')
    .filter((_, el) => el.innerText.trim() === value)
    .click({ force: true });
};
export const selectOptionFromDropdown = (testId, value) => {
  // Open the dropdown using mousedown instead of click
  cy.get('[data-testid="' + testId + '"] [role="combobox"]').trigger('mousedown', {
    button: 0,
    force: true
  });

  // Select the option
  cy.get('li[role="option"]')
    .filter((_, el) => el.innerText.trim() === value)
    .click({ force: true });
};

export const clickProposalTypePrincipleInvestigator = () => selectId('ProposalType-1');
export const clickSubProposalTypeTargetOfOpportunity = () => selectId('proposalAttribute-1');

export const verifyOsdDataCycleID = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(`${osdData[0]?.observatory_policy?.cycle_information?.cycle_id}_ID`).to.equal(data);
  });
};

export const verifyOsdDataCycleDescription = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(osdData[0]?.observatory_policy?.cycle_description).to.equal(data);
  });
};

export const verifyOsdDataProposalOpen = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(osdData[0]?.observatory_policy?.cycle_information?.proposal_open).to.equal(data);
    verifyContent('SKAO_2027_1_opens', '27-03-2026');
  });
};

export const verifyOsdDataProposalClose = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(osdData[0]?.observatory_policy?.cycle_information?.proposal_close).to.equal(data);
    verifyContent('SKAO_2027_1_closes', '12-05-2026');
  });
};

export const verifyOsdDataMaxTargets = data => {
  cy.fixture('osd.json').then(osdData => {
    expect(osdData[0]?.observatory_policy?.cycle_policies?.max_targets).to.equal(data);
  });
};

export const verifyScienceIdeaCreatedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Science Verification Idea added with unique identifier');

export const verifyAutoLinkAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Target added and auto-linked successfully');

export const verifySubmissionCreatedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Submission added with unique identifier');

export const verifyAlertFooter = text => {
  verifyContent('timeAlertFooter', text);
};

export const verifyInformationBannerText = text => {
  cy.get('[id="standardAlertId"]').contains(text);
};

export const verifyUserFoundAlertFooter = () =>
  verifyContent('timeAlertFooter', 'User was successfully found.');

export const verifyUserInvitedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Email invite has been sent.');

export const verifyTeamMemberAccessUpdatedAlertFooter = () =>
  verifyContent('timeAlertFooter', "Team member's access has been updated.", 30000);

export const clickEdit = () => {
  cy.get('[data-testId="editIcon"]').should('be.visible');
  cy.get('[data-testId="editIcon"]').click();
};

export const validateProposal = () => {
  clickToValidateProposal();
};

export const createStandardProposalLoggedIn = () => {
  clickAddSubmission();
  clickCycleSelectionMockProposal();
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

export const clickToObservationPage = () => {
  clickToNextPage();
  pageConfirmed('OBSERVATION');
};

export const verifySensitivityCalculatorStatusSuccess = () => {
  cy.get('[data-testid="statusId"]').should('exist');
  cy.get('[aria-label="Status : OK "]').should('exist');
};

export const addContinuumImagesObservatoryDataProduct = () => {
  clickAddDataProductEntry();
};

export const addSubmissionSummary = value => {
  cy.get('[data-testid="abstractId"]').should('exist');
  cy.get('[data-testid="abstractId"]').type(value);
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

export const updateFieldValue = (testId, value) => {
  cy.get(`[data-testid="${testId}"]`)
    .should('exist')
    .type('{selectall}{backspace}')
    .type(value);
};

export const verifyOnLandingPageFilterIsVisible = () => {
  cy.get('[data-testid="proposalType"]').should('exist');
  cy.get('[data-testid="proposalType"]').realClick();
  cy.get('[data-value="draft"]').realClick();
};

export const verifyMockedScienceIdeaOnLandingPageIsVisible = () => {
  cy.get('[data-testid="table-submissions"]').should('contain', 'sv-test');
};

export const verifyMockedProposalOnLandingPageIsVisible = () => {
  cy.get('[data-testid="table-submissions"]').should('contain', 'prsl-test');
};
export const verifyData = (testId, text) => {
  cy.get(`[data-testid="${testId}"]`).should('contain', text);
};

export const verifyDataInTable = (tableTestId, text) => {
  cy.get(`[data-testid="${tableTestId}"]`)
    .find('[role="row"]')
    .filter(`:contains("${text}")`);
};

export const verifyFieldError = (testId, error, exists) => {
  const selector = `[data-testid="${testId}"]`;

  cy.get(selector)
    .should('exist')
    .parent() // move to parent
    .then($parent => {
      if (exists) {
        cy.wrap($parent).should('contain.text', error);
      } else {
        cy.wrap($parent).should('not.contain.text', error);
      }
    });
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

export const clickEditIconForRow = (tableTestId, text) => {
  cy.get(`[data-testid="${tableTestId}"]`)
    .find('[role="row"]')
    .filter(`:contains("${text}")`)
    .click()
    .first()
    .within(() => {
      cy.get('[data-testid="editIcon"]')
        .should('be.visible')
        .click();
    });
};

export const clickEditUserRightsIconForRow = (tableTestId, text) => {
  cy.get(`[data-testid="${tableTestId}"]`)
    .find('[role="row"]')
    .filter(`:contains("${text}")`)
    .click()
    .first()
    .within(() => {
      cy.get('[data-testid="lockIcon"]')
        .should('be.visible')
        .click();
    });
};

export const clickIconForRow = (tableTestId, iconTestId, text) => {
  cy.get(`[data-testid="${tableTestId}"]`)
    .find('[role="row"]')
    .filter(`:contains("${text}")`)
    .click()
    .first()
    .within(() => {
      cy.get(`[data-testid="${iconTestId}"]`)
        .should('be.visible')
        .click();
    });
};

const clickToValidateProposal = () => {
  cy.get('[data-testid="validateBtn"]').should('exist');
  cy.get('[data-testid="validateBtn"]').click();
};

export const clickToValidateSV = () => {
  cy.get('[data-testid="submitBtnTestId"]').should('exist');
  cy.get('[data-testid="submitBtnTestId"]').click();
};

export const clickToSubmitProposal = () => {
  cy.get('[data-testid="submitBtnTestId"]').should('exist');
  cy.get('[data-testid="submitBtnTestId"]').click();
};
