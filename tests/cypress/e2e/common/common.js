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
import {
  fetchLiveIndigoToken,
  intercept,
  isLiveMode,
  liveMemberEmail,
  liveMemberFirstName
} from './liveAuth';

export { isLiveMode, liveMemberEmail, liveMemberFirstName };

const visitWithAuth = (user, token, extras) =>
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.setItem('cypress:group', user.group);
      win.localStorage.setItem('cypress:token', token);
      win.localStorage.setItem('cypress:account', JSON.stringify(user));
      // Read by src/utils/constants.ts' cypressLiveMode - lets app code that would otherwise
      // unconditionally mock under cypressToken (e.g. GetProposalsReviewable) fall through to a
      // real request when this run is actually live.
      win.localStorage.setItem('cypress:liveMode', isLiveMode() ? 'true' : 'false');
      Object.entries(extras).forEach(([k, v]) => win.localStorage.setItem(k, v));
    }
  });

export const initialize = (user, extras = {}) => {
  viewPort();
  if (isLiveMode()) {
    fetchLiveIndigoToken().then((token) => visitWithAuth(user, token, extras));
  } else {
    visitWithAuth(user, user.token, extras);
  }
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
  cy.window().then((win) => {
    win.localStorage.clear();
  });
};

// Stubbed API calls
// see: https://docs.cypress.io/app/guides/network-requests#Routing

export const mockCreateProposalAPI = () => {
  intercept('POST', '**/pht/prsls/create', 'mockCreateProposal', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('cypress:token');
      cy.fixture('proposal.json').then((submission) => {
        cy.intercept('POST', '**/pht/prsls/create', (req) => {
          req.headers['Authorization'] = `Bearer ${token}`;
          req.reply({
            statusCode: 200,
            body: submission
          });
        }).as('mockCreateProposal');
      });
    });
  });
};

export const mockCreateSVIdeaAPI = () => {
  intercept('POST', '**/pht/prsls/create', 'mockCreateSVIdea', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('cypress:token');
      cy.fixture('svIdea.json').then((submission) => {
        cy.intercept('POST', '**/pht/prsls/create', (req) => {
          req.headers['Authorization'] = `Bearer ${token}`;
          req.reply({
            statusCode: 200,
            body: submission
          });
        }).as('mockCreateSVIdea');
      });
    });
  });
};

export const mockGetUserByEmailAPI = () => {
  // In live mode there's no fixture user to stub - the real backend is queried for whichever
  // email the spec actually searches for (see liveMemberEmail()), not the fake Trevor Swain
  // fixture used in mocked mode.
  const email = isLiveMode() ? liveMemberEmail() : 'Trevor.Swain@community.skao.int';
  intercept('GET', `**/pht/prsls/member/${email}`, 'mockGetUserByEmailAPI', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('cypress:token');
      cy.fixture('userMSGraph.json').then((user) => {
        cy.intercept('GET', `**/pht/prsls/member/${email}`, (req) => {
          req.headers['Authorization'] = `Bearer ${token}`;
          req.reply({
            statusCode: 200,
            body: user
          });
        }).as('mockGetUserByEmailAPI');
      });
    });
  });
};

export const mockCreateProposalAccessAPI = () => {
  intercept('POST', '**/pht/proposal-access/create', 'mockCreateProposalAccessAPI', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('cypress:token');
      cy.intercept('POST', '**/pht/proposal-access/create', (req) => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: { message: 'prslacc-ddfdbe-733d6b8' }
        });
      }).as('mockCreateProposalAccessAPI');
    });
  });
};

export const mockEmailAPI = () => {
  intercept('POST', '**/pht/prsls/send-email/', 'mockInviteUserByEmail', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('cypress:token');
      cy.intercept('POST', '**/pht/prsls/send-email/', (req) => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: { message: 'Email sent successfully' }
        });
      }).as('mockInviteUserByEmail');
    });
  });
};

export const mockResolveTargetAPI = () => {
  intercept('GET', '**/coordinates/M2/equatorial', 'mockResolveTarget', () => {
    cy.fixture('target.json').then((target) => {
      cy.intercept('GET', '**/coordinates/M2/equatorial', {
        statusCode: 200,
        body: target
      }).as('mockResolveTarget');
    });
  });
};

export const mockOSDAPI = () => {
  intercept('GET', '**/osd/cycles', 'mockOSDData', () => {
    cy.intercept('GET', '**/osd/cycles', { fixture: 'osd.json' }).as('mockOSDData');
  });
  // GetOSDCycles also fetches ODT configuration alongside OSD cycles (see BTN-3416) - without
  // this intercept the real request fails, GetOSDCycles rejects the whole Promise.all, and no
  // cycle policies ever load.
  intercept('GET', '**/odt/configuration', 'mockODTConfiguration', () => {
    cy.intercept('GET', '**/odt/configuration', { fixture: 'odtConfiguration.json' }).as(
      'mockODTConfiguration'
    );
  });
};

// The reviewer flows review the mock proposal list (mockProposalBackendList.tsx), whose
// "In a galaxy far, far away" proposal is on cycle SKA_2026_1 - ReviewListPage derives its
// SV/standard wording from that proposal's own cycle (via getCycle), so this cycle must be
// resolvable. Kept separate from osd.json/mockOSDAPI: osd.json's single-entry order is relied
// on directly (unreversed) by verifyOsdDataCycleID elsewhere, so it can't gain a second entry
// without breaking that.
export const mockOSDAPIWithReviewCycle = () => {
  intercept('GET', '**/osd/cycles', 'mockOSDData', () => {
    cy.intercept('GET', '**/osd/cycles', { fixture: 'osdWithReviewCycle.json' }).as('mockOSDData');
  });
  intercept('GET', '**/odt/configuration', 'mockODTConfiguration', () => {
    cy.intercept('GET', '**/odt/configuration', { fixture: 'odtConfiguration.json' }).as(
      'mockODTConfiguration'
    );
  });
};

export const mockValidateAPI = () => {
  intercept('POST', '**/pht/prsls/validate', 'mockValidate', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('cypress:token');
      cy.intercept('POST', '**/pht/prsls/validate', (req) => {
        req.headers['Authorization'] = `Bearer ${token}`;
        req.reply({
          statusCode: 200,
          body: { result: true, validation_errors: [] }
        });
      }).as('mockValidate');
    });
  });
};

export const mockValidateSVIdeaAPI = () => {
  intercept('POST', '**/pht/prsls/validate', 'mockValidateSVIdea', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('cypress:token');
      cy.fixture('validateSVIdea.json').then((submission) => {
        cy.intercept('POST', '**/pht/prsls/validate', (req) => {
          req.headers['Authorization'] = `Bearer ${token}`;
          req.reply({
            statusCode: 200,
            body: { result: true, validation_errors: [] }
          });
        }).as('mockValidateSVIdea');
      });
    });
  });
};

/*----------------------------------------------------------------------*/

export const verify = (testId) => {
  verifyExists(testId);
  verifyVisible(testId);
};

export const clickButton = (testId) => {
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
// Stub-only - no standard/PI-proposal cycle is seeded in the real backend yet (only a Science
// Verification one), so this only ever needs to match the mock fixture's cycle. Callers should
// skip in live mode (see isLiveMode) rather than try to make this generic.
export const clickCycleSelectionMockProposal = () => clickButton('CYCLE-003_ID');
// Selects by the cycle's rendered description text rather than its exact ID - the stub fixture's
// SV cycle is "SKAO_2027_1", but a real backend's own seeded SV cycle has a different ID (e.g.
// "TEST_SKAO_2027_1"), so a hardcoded `${cycleId}_ID` testid only ever matches one of the two.
// CycleSelection.tsx doesn't render the OSD `type` field, so description text (which both the
// fixture and every real SV cycle include "Science Verification" in) is the next best generic
// discriminator - matching how the component's own unit tests already select a card.
export const clickCycleSelectionSV = () => {
  cy.contains('[data-testid$="_description"]', 'Science Verification').click();
};

// Picks the Science Verification cycle with the latest proposal_open date, rather than whichever
// SV card happens to render first (clickCycleSelectionSV) - matters once a real backend has more
// than one SV cycle seeded over time, where specs exercising "the current cycle" specifically
// mean the most recently opened one. Requires OSD data to already be cy.wait()-ed onto
// '@mockOSDData' (see getOsdData).
export const selectMostRecentSVCycle = () => {
  getOsdData().then((osdData) => {
    const svCycles = osdData.filter((entry) =>
      (entry.observatory_policy?.type ?? '').toLowerCase().includes('science verification')
    );
    const mostRecent = svCycles.reduce((latest, current) => {
      const latestOpen = new Date(latest.observatory_policy.cycle_information.proposal_open);
      const currentOpen = new Date(current.observatory_policy.cycle_information.proposal_open);
      return currentOpen > latestOpen ? current : latest;
    });
    const cycleId = mostRecent.observatory_policy.cycle_information.cycle_id;
    cy.get(`[data-testid="${cycleId}_ID"]`).click();
  });
  clickCycleConfirm();
};
export const clickToConfirmProposalSubmission = () => clickButton('displayConfirmationButton');
export const clickToNextPage = () => clickButton('nextButtonTestId');
export const clickFileUploadArea = () => clickButton('fileUpload');
export const clickFileUpload = () => clickButton('fileUploadUploadButton');
export const clickRank9 = () => clickButton('Rank9');
export const clickFeasibilityYes = () => clickButton('FeasibilityYes');
export const clickStatusIconNav = (testId) => {
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
    cy.get('body').find(`[data-testid="${testId}"]`).should('not.exist');
  }
};
/*----------------------------------------------------------------------*/

export const uploadTestFile = (fileName) => {
  cy.get('[data-testid="fileUpload"] input[type="file"]').attachFile(fileName);
};

export const verifyTestFileUploaded = (fileName) => {
  cy.contains(fileName).should('be.visible');
};
export const clickNav = (testId, title) => {
  click(testId);
  if (title.length) {
    verifyContent('pageTitle', title);
  }
};

export const clickFirstPanel = () => get('dataGridId').find('.MuiDataGrid-row').first().click();

export const clickPanelProposalsTab = () => selectId('simple-tab-1');

export const verifyReviewerOnGridIsVisible = (ReviewerName) => {
  verifyContent('dataGridReviewers', ReviewerName);
};
export const verifyProposalOnGridIsVisible = (ProposalName) => {
  verifyContent('dataGridProposals', ProposalName);
};

export const clickLinkedTickedBox = (index) => {
  getCheckboxInRow(index).click({ force: true });
};

export const verifyTickBoxIsSelected = (index) => {
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
export const clickUserMenuReviews = () =>
  clickSignINBtns('menuItemReviews', 'REVIEW SCIENCE VERIFICATION IDEAS');
export const clickUserMenuDecisions = () =>
  clickSignINBtns('menuItemReviewDecisions', 'REVIEW DECISIONS');

/*----------------------------------------------------------------------*/

function verifyUserMenu(testId, shouldExist) {
  const selector = `[data-testid="${testId}"]`;

  if (shouldExist) {
    cy.get(selector).should('exist').and('be.visible');
  } else {
    cy.get('body').then(($body) => {
      if ($body.find(selector).length > 0) {
        cy.get(selector).should('not.be.visible');
      } else {
        cy.log(`Menu item "${testId}" not found, as expected`);
      }
    });
  }
}
export const verifyUserMenuOverview = (exists) => verifyUserMenu('menuItemOverview', exists);
export const verifyUserMenuProposals = (exists) => verifyUserMenu('menuItemProposals', exists);
export const verifyUserMenuPanels = (exists) => verifyUserMenu('menuItemPanelSummary', exists);
export const verifyUserMenuReviews = (exists) => verifyUserMenu('menuItemReviews', exists);
export const verifyUserMenuDecisions = (exists) =>
  verifyUserMenu('menuItemReviewDecisions', exists);

/*----------------------------------------------------------------------*/

export const pageConfirmed = (label) => cy.get('#pageTitle').contains(label);
export const verifyOnLandingPage = () => verifyExists('addSubmissionButton');

export const clickConfirmButtonWithinPopup = () => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('[data-testid="displayConfirmationButton"]').click();
  });
};

export const clickGeneralCommentsTab = (testId) => {
  cy.get(`[data-testid="${testId}"]`).click({
    force: true
  });
};

/*----------------------------------------------------------------------*/

export const enterProposalTitle = () => entry('titleId', 'Proposal Title');
export const enterScienceVerificationIdeaTitle = (title = 'Science Verification Idea Title') =>
  entry('titleId', title);

export const selectObservingMode = (value) => {
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

// Reads the actual response body of the (already cy.wait()-ed) '@mockOSDData' interception -
// the stubbed fixture content in mocked mode, or the real backend's real response in live mode
// (see liveAuth.js's intercept()) - rather than re-reading a specific fixture file directly.
// That keeps these assertions honest about what the app actually received, in either mode, and
// correct even for callers using a different OSD fixture variant (e.g.
// mockOSDAPIWithReviewCycle's osdWithReviewCycle.json) than the one hardcoded here previously.
export const getOsdData = () => cy.get('@mockOSDData').its('response.body');

export const verifyOsdDataCycleID = (data) => {
  getOsdData().then((osdData) => {
    expect(`${osdData[0]?.observatory_policy?.cycle_information?.cycle_id}_ID`).to.equal(data);
  });
};

export const verifyOsdDataCycleDescription = (data) => {
  getOsdData().then((osdData) => {
    expect(osdData[0]?.observatory_policy?.cycle_description).to.equal(data);
  });
};

const normalizeDateStr = (str) => str.replace(/^(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T');
const formatDateForLocale = (str) =>
  new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' }).format(
    new Date(normalizeDateStr(str))
  );

// The opens/closes testids are prefixed with the cycle's own ID (see clickCycleSelectionSV's
// comment - that ID differs between the stub fixture and a real backend's seeded cycle), so
// derive the prefix from whichever SV card is actually on screen rather than hardcoding it.
const getScienceVerificationCycleTestIdPrefix = () =>
  cy
    .contains('[data-testid$="_description"]', 'Science Verification')
    .invoke('attr', 'data-testid')
    .then((testId) => testId.replace(/_description$/, ''));

export const verifyOsdDataProposalOpen = (data) => {
  getOsdData().then((osdData) => {
    expect(osdData[0]?.observatory_policy?.cycle_information?.proposal_open).to.equal(data);
  });
  getScienceVerificationCycleTestIdPrefix().then((prefix) =>
    verifyContent(`${prefix}_opens`, formatDateForLocale(data))
  );
};

export const verifyOsdDataProposalClose = (data) => {
  getOsdData().then((osdData) => {
    expect(osdData[0]?.observatory_policy?.cycle_information?.proposal_close).to.equal(data);
  });
  getScienceVerificationCycleTestIdPrefix().then((prefix) =>
    verifyContent(`${prefix}_closes`, formatDateForLocale(data))
  );
};

export const verifyOsdDataMaxTargets = (data) => {
  getOsdData().then((osdData) => {
    expect(osdData[0]?.observatory_policy?.cycle_policies?.max_targets).to.equal(data);
  });
};

export const verifyScienceIdeaCreatedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Science Verification Idea added with unique identifier');

export const verifyAutoLinkAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Target added and auto-linked successfully');

export const verifySubmissionCreatedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Submission added with unique identifier');

export const verifyAlertFooter = (text) => {
  verifyContent('timeAlertFooter', text);
};

export const verifyInformationBannerText = (text) => {
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

// Composed session setup - most specs were hand-typing the same eight-to-ten step "mock the
// backend, log in, pick a cycle, create a submission" sequence in their own beforeEach/it. These
// compose it from the atomic mock*/click*/verify* helpers above, in three layers:
//   beginXSession    - mocks + logs in + opens the create dialog, stops after the OSD data loads
//                       (a seam for the one test that asserts on the raw OSD fixture content)
//   selectXCycle     - picks the cycle and confirms it
//   completeXCreation - fills in the remaining required fields and submits
// createXSession chains all three for the common case: a spec that just needs a freshly created
// submission to start testing from.

export const beginScienceIdeaSession = (user, extras = {}) => {
  mockOSDAPI();
  initialize(user, extras);
  mockCreateSVIdeaAPI();
  clickAddSubmission();
  cy.wait('@mockOSDData');
};

export const selectScienceVerificationCycle = () => {
  clickCycleSelectionSV();
  clickCycleConfirm();
};

export const completeScienceIdeaCreation = (title) => {
  enterScienceVerificationIdeaTitle(title);
  clickCreateSubmission();
  cy.wait('@mockCreateSVIdea');
  verifyScienceIdeaCreatedAlertFooter();
  pageConfirmed('TEAM');
};

export const createScienceIdeaSession = (user, extras = {}) => {
  beginScienceIdeaSession(user, extras);
  selectScienceVerificationCycle();
  completeScienceIdeaCreation();
};

export const beginStandardProposalSession = (user, extras = {}) => {
  mockOSDAPI();
  initialize(user, extras);
  mockCreateProposalAPI();
  clickAddSubmission();
  cy.wait('@mockOSDData');
};

export const selectStandardProposalCycle = () => {
  clickCycleSelectionMockProposal();
  clickCycleConfirm();
};

export const completeStandardProposalCreation = () => {
  enterProposalTitle();
  clickProposalTypePrincipleInvestigator();
  clickSubProposalTypeTargetOfOpportunity();
  clickCreateSubmission();
  cy.wait('@mockCreateProposal');
  verifySubmissionCreatedAlertFooter();
  pageConfirmed('TEAM');
};

export const createStandardProposalSession = (user, extras = {}) => {
  beginStandardProposalSession(user, extras);
  selectStandardProposalCycle();
  completeStandardProposalCreation();
};

// Tears down a real proposal created by a live-mode spec, so repeated runs don't accumulate test
// data in a shared environment's reviewable queue. There's no working UI for this - GridProposals'
// delete icon is hardcoded `disabled` pending an API completion (see its own "TO BE re-introduced"
// comment) - so this goes straight to the real REST API instead: fetch the proposal as the
// backend has it (already in the shape a PUT expects) and write it back with status flipped to
// 'withdrawn' (see ska-oso-pdm's ProposalStatus.WITHDRAWN), the same soft-delete PutProposal
// itself would perform once that UI path is re-enabled. Only meaningful in live mode - there's
// nothing real to tear down against the stub backend.
export const withdrawProposal = (prslId) => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('cypress:token');
    const basePath = win.env.REACT_APP_SKA_OSO_SERVICES_URL;
    const url = `${basePath}/pht/prsls/${prslId}`;
    const headers = { Authorization: `Bearer ${token}` };

    cy.request({ method: 'GET', url, headers }).then((getResponse) => {
      cy.request({
        method: 'PUT',
        url,
        headers,
        body: { ...getResponse.body, status: 'withdrawn' }
      });
    });
  });
};

// The "select observing mode, add the M2 target via resolve, confirm auto-link" sub-flow that
// most SV specs need once a session exists. summary is optional since callers add it at different
// points (or not at all).
export const addM2TargetAndAutoLink = (observingMode = 'Continuum', summary = null) => {
  clickStatusIconNav('statusId2'); // Details page
  pageConfirmed('DETAILS');
  selectObservingMode(observingMode);
  if (summary) {
    addSubmissionSummary(summary);
  }
  clickStatusIconNav('statusId4'); // Target page
  pageConfirmed('TARGET');
  addM2TargetUsingResolve();
  cy.wait('@mockResolveTarget');
  clickToAddTarget();
  verifyAutoLinkAlertFooter();
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

export const addSubmissionSummary = (value) => {
  cy.get('[data-testid="abstractId"]').should('exist');
  cy.get('[data-testid="abstractId"]').type(value);
};

export const addM2TargetUsingResolve = () => {
  cy.get('[data-testid="name"]').should('exist');
  cy.get('[data-testid="name"]').type('M2');
  clickResolveButton();
};

export const updateDataProductField = (testId, value) => {
  // The underlying NumberEntry component puts data-testid on the outer MuiFormControl
  // wrapper, not the actual <input> - type into the nested input directly, otherwise
  // Cypress silently types into the non-editable wrapper and the field never changes.
  cy.get('[data-testid="' + testId + '"]').should('exist');
  cy.get('[data-testid="' + testId + '"] input').type(value);
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
  cy.get(`[data-testid="${testId}"]`).should('exist').type('{selectall}{backspace}').type(value);
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
  cy.get(`[data-testid="${tableTestId}"]`).find('[role="row"]').filter(`:contains("${text}")`);
};

export const verifyFieldError = (testId, error, exists) => {
  const selector = `[data-testid="${testId}"]`;

  cy.get(selector)
    .should('exist')
    .parent() // move to parent
    .then(($parent) => {
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
      cy.get('[data-field="coord1"]').should('contain', ra);
      cy.get('[data-field="coord2"]').should('contain', dec);
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
      cy.get('[data-testid="editIcon"]').should('be.visible').click();
    });
};

export const clickEditUserRightsIconForRow = (tableTestId, text) => {
  cy.get(`[data-testid="${tableTestId}"]`)
    .find('[role="row"]')
    .filter(`:contains("${text}")`)
    .click()
    .first()
    .within(() => {
      cy.get('[data-testid="lockIcon"]').should('be.visible').click();
    });
};

export const clickIconForRow = (tableTestId, iconTestId, text) => {
  cy.get(`[data-testid="${tableTestId}"]`)
    .find('[role="row"]')
    .filter(`:contains("${text}")`)
    .click()
    .first()
    .within(() => {
      cy.get(`[data-testid="${iconTestId}"]`).should('be.visible').click();
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
