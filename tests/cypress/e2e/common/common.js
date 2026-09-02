import {
  click,
  entry,
  selectId,
  verifyContent,
  verifyExists,
  verifyVisible,
  viewPort
} from '../../fixtures/utils/cypress';
import {
  fetchLiveOpsToken,
  liveMemberEmail,
  liveMemberFirstName,
  loginAsUser
} from './cypressTestAuth';

export { liveMemberEmail, liveMemberFirstName };

// visitWithAuth logs in via a real MSAL session (see cypressTestAuth.js's loginAsUser) and then
// does its own cy.visit() on top of that restored session, purely to set any extras via
// onBeforeLoad - login itself no longer happens here.
const visitWithAuth = (user, extras) => {
  loginAsUser(user.username);
  cy.visit('/', {
    onBeforeLoad(win) {
      Object.entries(extras).forEach(([k, v]) => win.localStorage.setItem(k, v));
    }
  });
};

export const initialize = (user, extras = {}) => {
  viewPort();
  visitWithAuth(user, extras);
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

// Network intercepts - see: https://docs.cypress.io/app/guides/network-requests#Routing
// These are spies on the real backend (not stubs) - every run is live now.

export const mockCreateSVIdeaAPI = () => {
  cy.intercept('POST', '**/pht/prsls/create').as('mockCreateSVIdea');
};

export const mockEmailAPI = () => {
  cy.intercept('POST', '**/pht/prsls/send-email/').as('mockInviteUserByEmail');
};

export const mockResolveTargetAPI = () => {
  cy.intercept('GET', '**/coordinates/M2/equatorial').as('mockResolveTarget');
};

export const mockOSDAPI = () => {
  cy.intercept('GET', '**/osd/cycles').as('mockOSDData');
  // GetOSDCycles also fetches ODT configuration alongside OSD cycles (see BTN-3416) - without
  // this intercept the real request fails, GetOSDCycles rejects the whole Promise.all, and no
  // cycle policies ever load.
  cy.intercept('GET', '**/odt/configuration').as('mockODTConfiguration');
};

// Stub-only - no standard/PI-proposal cycle is seeded in the real backend yet (only a Science
// Verification one), so nothing currently exercises this path live. Kept ready for when a
// matching cycle exists (see createStandardProposalSession's callers, all currently skipped).
export const mockCreateProposalAPI = () => {
  cy.intercept('POST', '**/pht/prsls/create').as('mockCreateProposal');
};

export const mockValidateAPI = () => {
  cy.intercept('POST', '**/pht/prsls/validate').as('mockValidate');
};

export const mockValidateSVIdeaAPI = () => {
  cy.intercept('POST', '**/pht/prsls/validate').as('mockValidateSVIdea');
};

export const mockGetUserByEmailAPI = () => {
  cy.intercept('GET', `**/pht/prsls/member/${liveMemberEmail()}`).as('mockGetUserByEmailAPI');
};

export const mockCreateProposalAccessAPI = () => {
  cy.intercept('POST', '**/pht/proposal-access/create').as('mockCreateProposalAccessAPI');
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

export const clickAddSubmission = () => clickButton('addSubmissionButton');
export const clickCreateSubmission = () => clickButton('nextButtonTestId');
export const clickHome = () => clickButton('homeButtonTestId');
export const clickDialogConfirm = () => clickButton('dialogConfirmationButton');
export const clickCycleConfirm = () => clickButton('cycleConfirmationButton');
export const clickUserMenu = () => clickButton('usernameMenu');
export const clickResolveButton = () => clickButton('resolveButton');
export const clickToAddTarget = () => clickButton('addTargetButton');
export const clickAddDataProduct = () => clickButton('addDataProductButton');
export const clickAddDataProductEntry = () => clickButton('addDataProductButtonEntry');
export const clickUserSearch = () => clickButton('userSearchButton');
export const clickSubmitRights = () => clickButton('submitCheckbox');
export const clickObservationSetup = () => clickButton('addObservationButton');
export const clickAddObservationEntry = () => clickButton('addObservationButtonEntry');
export const clickSendInviteButton = () => clickButton('sendInviteButton');
export const clickToConfirmProposalSubmission = () => clickButton('displayConfirmationButton');
export const clickToNextPage = () => clickButton('nextButtonTestId');
export const clickFileUpload = () => clickButton('fileUploadUploadButton');
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
const clickToValidateProposal = () => {
  cy.get('[data-testid="validateBtn"]').should('exist');
  cy.get('[data-testid="validateBtn"]').click();
};
export const validateProposal = () => {
  clickToValidateProposal();
};
export const clickToValidateSV = () => {
  cy.get('[data-testid="submitBtnTestId"]').should('exist');
  cy.get('[data-testid="submitBtnTestId"]').click();
};
export const clickToSubmitProposal = () => {
  cy.get('[data-testid="submitBtnTestId"]').should('exist');
  cy.get('[data-testid="submitBtnTestId"]').click();
};
export const clickObservationFromTable = () => {
  cy.get('[data-rowindex="0"]').click({ multiple: true });
};
export const clickToLinkTargetAndObservation = () => {
  cy.get('[data-testid="linkedTickBox"]').click({ multiple: true });
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
// Stub-only - no standard/PI-proposal cycle is seeded in the real backend yet (only a Science
// Verification one), so this only ever needs to match the mock fixture's cycle. Kept ready for
// when a matching cycle exists on the real backend.
export const clickCycleSelectionMockProposal = () => clickButton('CYCLE-003_ID');
export const enterProposalTitle = () => entry('titleId', 'Proposal Title');
export const clickProposalTypePrincipleInvestigator = () => selectId('ProposalType-1');
export const clickSubProposalTypeTargetOfOpportunity = () => selectId('proposalAttribute-1');
export const verifySubmissionCreatedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Submission added with unique identifier');
export const verifyMockedProposalOnLandingPageIsVisible = () => {
  cy.get('[data-testid="table-submissions"]').should('contain', 'prsl-test');
};
export const verifyData = (testId, text) => {
  cy.get(`[data-testid="${testId}"]`).should('contain', text);
};
export const verifyDataInTable = (tableTestId, text) => {
  cy.get(`[data-testid="${tableTestId}"]`).find('[role="row"]').filter(`:contains("${text}")`);
};
export const uploadTestFile = (fileName) => {
  cy.get('[data-testid="fileUpload"] input[type="file"]').attachFile(fileName);
};
export const verifyTestFileUploaded = (fileName) => {
  cy.contains(fileName).should('be.visible');
};
export const verifyAlertFooter = (text) => {
  verifyContent('timeAlertFooter', text);
};
export const verifyUserFoundAlertFooter = () =>
  verifyContent('timeAlertFooter', 'User was successfully found.');
export const verifyUserInvitedAlertFooter = () =>
  verifyContent('timeAlertFooter', 'Email invite has been sent.');
export const verifyTeamMemberAccessUpdatedAlertFooter = () =>
  verifyContent('timeAlertFooter', "Team member's access has been updated.", 30000);
// Selects by the cycle's rendered description text rather than its exact ID - CycleSelection.tsx
// doesn't render the OSD `type` field, so description text (which every real SV cycle includes
// "Science Verification" in) is the next best generic discriminator - matching how the
// component's own unit tests already select a card.
export const clickCycleSelectionSV = () => {
  cy.contains('[data-testid$="_description"]', 'Science Verification').click();
};

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

export const clickNav = (testId, title) => {
  click(testId);
  if (title.length) {
    verifyContent('pageTitle', title);
  }
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
// The reviews page's title depends on the real reviewable list's own cycle data (see
// ReviewListPage.tsx's reviewListIsSV comment) - it's not a fixed string, so skip the title check
// there the same way clickUserMenuProposals already does for its own destination page.
export const clickUserMenuReviews = () => clickSignINBtns('menuItemReviews', '');
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

/*----------------------------------------------------------------------*/

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

// Reads the actual response body of the (already cy.wait()-ed) '@mockOSDData' interception,
// rather than re-reading a specific fixture file directly - that keeps these assertions honest
// about what the app actually received.
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

// The opens/closes testids are prefixed with the cycle's own ID, so derive the prefix from
// whichever SV card is actually on screen rather than hardcoding it.
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

export const verifyInformationBannerText = (text) => {
  cy.get('[id="standardAlertId"]').contains(text);
};

export const clickEdit = () => {
  cy.get('[data-testId="editIcon"]').should('be.visible');
  cy.get('[data-testId="editIcon"]').click();
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

// Appends a proposal to a panel's own `proposals` array via a direct PUT, rather than going
// through /panels/assignments. This is a temporary workaround for the fact that the real backend's
// `/panels/assignments` endpoint can only assign a proposal to a panel for a proposal that has been
// submitted and until we are able to attach a PDF to the proposal, we cannot submit it.
// TODO: Remove this function once it is possible to asstach a PDF to a proposal and submit it.
export const assignProposalToPanel = (panelId, prslId) => {
  cy.window().then((win) => {
    fetchLiveOpsToken().then((token) => {
      const basePath = win.env.REACT_APP_SKA_OSO_SERVICES_URL;
      const url = `${basePath}/pht/panels/${panelId}`;
      const headers = { Authorization: `Bearer ${token}` };

      // panelId is long-lived fixture data on the real staging environment but a fresh/empty
      // local ODA won't have it. If the GET 404s, create a new panel
      // with the same ID and cycle, then PUT the proposal into it.
      cy.request({ method: 'GET', url, headers, failOnStatusCode: false }).then((getResponse) => {
        const panelExists = getResponse.status === 200;
        const panel = panelExists
          ? getResponse.body
          : {
              panel_id: panelId,
              name: 'Science Verification',
              cycle: 'TEST_SKAO_2027_Low_AA2_SV',
              proposals: []
            };

        (panelExists
          ? cy.wrap(null)
          : cy.request({
              method: 'POST',
              url: `${basePath}/pht/panels/create`,
              headers,
              body: panel
            })
        ).then(() => {
          const alreadyAssigned = (panel.proposals || []).some((p) => p.prsl_id === prslId);
          if (alreadyAssigned) {
            return;
          }
          cy.request({
            method: 'PUT',
            url,
            headers,
            body: {
              ...panel,
              proposals: [
                ...(panel.proposals || []),
                { prsl_id: prslId, assigned_on: new Date().toISOString() }
              ]
            }
          });
        });
      });
    });
  });
};

// Composed session setup - most specs were hand-typing the same eight-to-ten step "mock the
// backend, log in, pick a cycle, create a submission" sequence in their own beforeEach/it. These
// compose it from the atomic mock*/click*/verify* helpers above, in three layers:
//   beginScienceIdeaSession    - mocks + logs in + opens the create dialog, stops after the OSD
//                                 data loads (a seam for the one test that asserts on the raw OSD
//                                 fixture content)
//   selectScienceVerificationCycle - picks the cycle and confirms it
//   completeScienceIdeaCreation    - fills in the remaining required fields and submits
// createScienceIdeaSession chains all three for the common case: a spec that just needs a freshly
// created submission to start testing from.

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
  // postProposal.tsx calls the real refreshAuthToken() itself after creating the proposal, which
  // now genuinely forces MSAL to fetch a fresh token reflecting the new group membership - no
  // Cypress-side equivalent needed any more (there used to be one here; see git history).
  verifyScienceIdeaCreatedAlertFooter();
  pageConfirmed('TEAM');
};

export const createScienceIdeaSession = (user, extras = {}) => {
  beginScienceIdeaSession(user, extras);
  selectScienceVerificationCycle();
  completeScienceIdeaCreation();
};

// Same three-layer composition as the Science Idea session above, for the standard/PI-proposal
// flow. Stub-only for now - see clickCycleSelectionMockProposal's comment - kept ready for when a
// matching cycle exists on the real backend (see createStandardProposalSession's callers, all
// currently skipped for that reason).
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
