import { click, verifyContent, verifyExists, verifyVisible } from './cypress';
import { loginAsUser } from './auth';

// visitWithAuth logs in via a real MSAL session (see auth.js's loginAsUser) and then
// does its own cy.visit() on top of that restored session - login itself no longer happens here.
export const visitWithAuth = (user) => {
  loginAsUser(user.username);
  cy.visit('/');
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

export const mockOSDAPI = () => {
  cy.intercept('GET', '**/osd/cycles').as('mockOSDData');
  // GetOSDCycles also fetches ODT configuration alongside OSD cycles (see BTN-3416) - without
  // this intercept the real request fails, GetOSDCycles rejects the whole Promise.all, and no
  // cycle policies ever load.
  cy.intercept('GET', '**/odt/configuration').as('mockODTConfiguration');
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
export const clickUserMenu = () => clickButton('usernameMenu');
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
