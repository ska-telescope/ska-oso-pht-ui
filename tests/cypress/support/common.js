import { selectId } from './cypress';
import { fetchLiveOpsToken, loginAsUser, stubMsalForceRefresh } from './auth';
import { select, setChecked } from './editor/fields';

// visitWithAuth logs in via a real MSAL session (see auth.js's loginAsUser) and then
// does its own cy.visit() on top of that restored session - login itself no longer happens here.
export const visitWithAuth = (user) => {
  loginAsUser(user.username);
  cy.visit('/');
  // stub until User Portal is fully integrated with the new auth flow. Otherwise this can cause the tests to timeout.
  stubMsalForceRefresh();
};

// IMPROVEMENT  move cy. commands out of this file into cypress.js and create a function for it

export const initializeUserNotLoggedIn = () => {
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

/*----------------------------------------------------------------------*/

// Elements are found the way a user finds them: buttons by their names, fields by their labels
export const button = (name, options) => cy.findByRole('button', { name, ...options });

export const clickButton = (name) => button(name).scrollIntoView().should('be.visible').click();

// The library's user button is named after the signed-in user, so it's found by its description
export const userMenuButton = (options) => cy.get('[aria-description="User Button"]', options);

// The footer shows alerts like "Submission added with unique identifier ..."
export const verifyAlertFooter = (text, timeout = 10000) => cy.contains(text, { timeout });

// The status icon of a page in the page navigation, e.g. 'Observation'. Its label includes the
// page's status, e.g. "Status of the observation page : OK".
export const pageStatus = (pageName) =>
  cy.get(`[aria-label^="Status of the ${pageName.toLowerCase()} page : "]`);

const submissionsTable = () => cy.findByRole('table', { name: 'Table of Proposal Submissions' });

export const clickAddSubmission = () => clickButton('Submission');
export const clickCreateSubmission = () => clickButton('Create');
export const clickHome = () => clickButton('Home');
export const clickCycleConfirm = () =>
  cy.findByRole('dialog', { name: 'Cycle Selection' }).within(() => clickButton('Confirm'));
export const clickUserMenu = () => userMenuButton().should('be.visible').click();
export const clickToAddTarget = () => cy.findByRole('button', { name: 'Add Target' }).click();
export const clickAddDataProduct = () => clickButton('Data Product');
export const clickAddDataProductEntry = () => clickButton('Add');
export const clickObservationSetup = () => clickButton('Observation Setup');
export const clickAddObservationEntry = () => clickButton('Add');
export const clickToConfirmProposalSubmission = () => clickButton('Confirm Submission');
// The footer's next button is named after the page it goes to
export const clickToNextPage = (pageTitle) => clickButton(pageTitle);
export const clickFileUpload = () => clickButton('Upload');
export const clickToSubmitProposal = () => button('Submit').click();
export const clickObservationFromTable = () => {
  cy.get('[data-rowindex="0"]').click({ multiple: true });
};
// Ticks the box in every row of the grid, leaving any select-all box in the header alone
export const clickToLinkTargetAndObservation = () => {
  cy.get('[role="row"][data-rowindex] input[type="checkbox"]').click({ multiple: true });
};
export const clickToObservationPage = () => {
  clickToNextPage('Observation');
  pageConfirmed('OBSERVATION');
};
export const verifySensitivityCalculatorStatusSuccess = () => {
  cy.get('[aria-label="Status : OK "]').should('exist');
};
export const addContinuumImagesObservatoryDataProduct = () => {
  clickAddDataProductEntry();
};
export const selectOptionFromDropdown = (label, value) => select(label, value);
// Stub-only - no standard/PI-proposal cycle is seeded in the real backend yet (only a Science
// Verification one), so this only ever needs to match the mock fixture's cycle. Kept ready for
// when a matching cycle exists on the real backend.
export const clickCycleSelectionMockProposal = () =>
  cy.findByRole('dialog', { name: 'Cycle Selection' }).contains('button', 'CYCLE-003').click();
const titleField = () => cy.findByRole('textbox', { name: 'Title' });
export const enterProposalTitle = () => titleField().type('Proposal Title');
export const clickProposalTypePrincipleInvestigator = () =>
  selectId('ProposalType-standard_proposal');
export const clickSubProposalTypeTargetOfOpportunity = () =>
  selectId('proposalAttribute-target_of_opportunity');
export const verifySubmissionCreatedAlertFooter = () =>
  verifyAlertFooter('Submission added with unique identifier');
export const verifyMockedProposalOnLandingPageIsVisible = () => {
  submissionsTable().should('contain', 'prsl-test');
};
export const verifyDataInTable = (text) => {
  cy.contains('[role="row"]', text);
};
export const uploadTestFile = (fileName) => {
  cy.get('input[type="file"]').attachFile(fileName);
};
export const verifyTestFileUploaded = (fileName) => {
  cy.contains(fileName).should('be.visible');
};
// The cycle selection dialog's card for the Science Verification cycle. Selects by the cycle's
// rendered description text rather than its exact ID - CycleSelection.tsx doesn't render the OSD
// `type` field, so description text (which every real SV cycle includes "Science Verification"
// in) is the next best generic discriminator.
const scienceVerificationCycleCard = () =>
  cy.findByRole('dialog', { name: 'Cycle Selection' }).contains('button', 'Science Verification');

export const clickCycleSelectionSV = () => {
  scienceVerificationCycleCard().click();
};

// Goes to a page from the page navigation, e.g. 'Details'
export const clickStatusIconNav = (pageName) => {
  pageStatus(pageName).eq(0).click();
};

/*----------------------------------------------------------------------*/

export const checkFieldDisabled = (name, disabled) => {
  button(name).should(disabled ? 'be.disabled' : 'be.enabled');
};

export const checkFieldIsVisible = (name, visible) => {
  if (visible) {
    button(name).should('be.visible');
  } else {
    button(name).should('not.exist');
  }
};
/*----------------------------------------------------------------------*/

export const clickNav = (menuItem, title) => {
  cy.findByRole('menuitem', { name: menuItem }).click();
  if (title.length) {
    pageConfirmed(title);
  }
};

/*----------------------------------------------------------------------*/

export const clickSignINBtns = (menuItem, title) => {
  clickUserMenu();
  clickNav(menuItem, title);
};
export const clickUserMenuOverview = () => clickSignINBtns('Overview', 'OVERVIEW');
export const clickUserMenuProposals = () => clickSignINBtns('Submissions', '');
export const clickUserMenuPanels = () => clickSignINBtns('Panel Management', 'PANEL MANAGEMENT');
// The reviews page's title depends on the real reviewable list's own cycle data (see
// ReviewListPage.tsx's reviewListIsSV comment) - it's not a fixed string, so skip the title check
// there the same way clickUserMenuProposals already does for its own destination page.
export const clickUserMenuReviews = () => clickSignINBtns('Panel Reviews', '');
export const clickUserMenuDecisions = () => clickSignINBtns('Review Decisions', 'REVIEW DECISIONS');

/*----------------------------------------------------------------------*/

// A closed menu's items are hidden, so they aren't found by role
function verifyUserMenu(menuItem, shouldExist) {
  cy.findByRole('menuitem', { name: menuItem }).should(shouldExist ? 'be.visible' : 'not.exist');
}
export const verifyUserMenuOverview = (exists) => verifyUserMenu('Overview', exists);
export const verifyUserMenuProposals = (exists) => verifyUserMenu('Submissions', exists);
export const verifyUserMenuPanels = (exists) => verifyUserMenu('Panel Management', exists);
export const verifyUserMenuReviews = (exists) => verifyUserMenu('Panel Reviews', exists);
export const verifyUserMenuDecisions = (exists) => verifyUserMenu('Review Decisions', exists);

/*----------------------------------------------------------------------*/

export const pageConfirmed = (label) => cy.get('#pageTitle').contains(label);
export const verifyOnLandingPage = () => button('Submission', { timeout: 10000 }).should('exist');

/*----------------------------------------------------------------------*/

export const enterScienceVerificationIdeaTitle = (title = 'Science Verification Idea Title') =>
  titleField().type(title);

export const selectScienceCategory = (value) => select('Science Category', value);

// SV proposals have no science category - their observing mode, selected on the Details page, is
// the observation's type
export const selectObservingMode = (value) => select('Observing Mode', value);

// Ticks or unticks a tick box, e.g. the 'I' polarisation
export const setTickBox = (label, checked) => setChecked(label, checked);

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

export const verifyOsdDataProposalOpen = (data) => {
  getOsdData().then((osdData) => {
    expect(osdData[0]?.observatory_policy?.cycle_information?.proposal_open).to.equal(data);
  });
  scienceVerificationCycleCard().should('contain.text', formatDateForLocale(data));
};

export const verifyOsdDataProposalClose = (data) => {
  getOsdData().then((osdData) => {
    expect(osdData[0]?.observatory_policy?.cycle_information?.proposal_close).to.equal(data);
  });
  scienceVerificationCycleCard().should('contain.text', formatDateForLocale(data));
};

// 30000ms (not the verifyContent default of 10000ms) since this now waits on the real backend
// creating the idea (see common.js's "spies on the real backend" note above) rather than an
// instant stub reply - CI has been seen still showing the "please wait" placeholder at 10s.
export const verifyScienceIdeaCreatedAlertFooter = () =>
  verifyAlertFooter('Science Verification Idea added with unique identifier', 30000);

// Same real-backend latency reasoning as verifyScienceIdeaCreatedAlertFooter above - this waits
// on the real auto-link generation call, not a stub.
export const verifyAutoLinkAlertFooter = () =>
  verifyAlertFooter('Target added and auto-linked successfully', 30000);

export const clickEditIconForRow = (text) => {
  cy.contains('[role="row"]', text)
    .click()
    .within(() => {
      button('Edit proposal').should('be.visible').click();
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

export const beginScienceIdeaSession = (user) => {
  mockOSDAPI();
  visitWithAuth(user);
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
  // postProposal.tsx calls the real refreshAuthToken() itself after creating the proposal, to
  // fetch a fresh token reflecting the new group membership - stubMsalForceRefresh (wired up in
  // visitWithAuth()) short-circuits just that call, so it doesn't stall the success message below.
  verifyScienceIdeaCreatedAlertFooter();
  pageConfirmed('TEAM');
};

export const createScienceIdeaSession = (user) => {
  beginScienceIdeaSession(user);
  selectScienceVerificationCycle();
  completeScienceIdeaCreation();
};

// Same three-layer composition as the Science Idea session above, for the standard/PI-proposal
// flow. Stub-only for now - see clickCycleSelectionMockProposal's comment - kept ready for when a
// matching cycle exists on the real backend (see createStandardProposalSession's callers, all
// currently skipped for that reason).
export const beginStandardProposalSession = (user) => {
  mockOSDAPI();
  visitWithAuth(user);
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

export const createStandardProposalSession = (user) => {
  beginStandardProposalSession(user);
  selectStandardProposalCycle();
  completeStandardProposalCreation();
};

// The "select observing mode, add the M2 target, confirm auto-link" sub-flow that
// most SV specs need once a session exists. summary is optional since callers add it at different
// points (or not at all).
export const addM2TargetAndAutoLink = (observingMode = 'Continuum', summary = null) => {
  // New SV proposals start with a Continuum observation, so only other modes need selecting
  if (observingMode !== 'Continuum' || summary) {
    clickStatusIconNav('Details');
    pageConfirmed('DETAILS');
    if (observingMode !== 'Continuum') {
      selectObservingMode(observingMode);
    }
    if (summary) {
      addSubmissionSummary(summary);
    }
  }
  clickStatusIconNav('Target');
  pageConfirmed('TARGET');
  addM2Target();
  clickToAddTarget();
  verifyAutoLinkAlertFooter();
};

// The abstract, labelled "Idea Summary" for SV
export const submissionSummaryField = () =>
  cy.findByRole('textbox', { name: /^(Idea Summary|Abstract)$/ });

export const addSubmissionSummary = (value) => {
  submissionSummaryField().type(value);
};

// Types in the values the resolver gives M2, so the tests don't depend on the resolver's external
// services (only tests/cypress/e2e/sv/pages/target.cy.ts resolves)
export const addM2Target = () => {
  enterTargetField('Name', 'M2');
  enterTargetField('Right Ascension', '21:33:27.0200');
  enterTargetField('Declination', '-00:49:23.700');
  enterTargetField('Velocity', '-3.6');
};

// The target entry's fields are found by their labels, e.g. 'Name' or 'Right Ascension'
const targetField = (label) => cy.findAllByRole('textbox', { name: label });

export const enterTargetField = (label, value) => {
  targetField(label).first().type(value);
};

export const checkAddTargetDisabled = (disabled) => {
  cy.findByRole('button', { name: 'Add Target' }).should(disabled ? 'be.disabled' : 'be.enabled');
};

// A number field, e.g. 'Central Frequency'
export const numberField = (label) => cy.findByRole('spinbutton', { name: label });

export const updateFieldValue = (label, value) => {
  numberField(label).type('{selectall}{backspace}').type(value);
};

// The status filter's dropdown is labelled "Status types"
export const verifyOnLandingPageFilterIsVisible = () => {
  cy.contains('label', /^Status types/)
    .parent()
    .find('[role="combobox"]')
    .realClick();
  cy.get('[data-value="draft"]').realClick();
};

export const verifyMockedScienceIdeaOnLandingPageIsVisible = () => {
  submissionsTable().should('contain', 'Science Verification Idea Title');
};
