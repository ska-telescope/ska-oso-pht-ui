import {
  clickUserMenu,
  clickUserMenuPanels,
  clickUserMenuProposals,
  getSubmittedProposals,
  getReviewers,
  initialize,
  clearLocalStorage,
  clickUserMenuOverview,
  clickFirstPanel,
  clickPanelProposalsTab,
  verifyMockedAPICall,
  verifyUserMenuOverview,
  verifyUserMenuProposals,
  verifyUserMenuPanels,
  verifyUserMenuReviews,
  verifyUserMenuDecisions,
  verifyProposalOnGridIsVisible,
  verifyReviewerOnGridIsVisible
} from '../../common/common';
import { reviewerAdmin } from '../users.js';

describe('Review Administrator', () => {
  beforeEach(() => {
    initialize(reviewerAdmin);
    cy.window().then(win => {
      win.localStorage.setItem('USE_LOCAL_DATA', 'true');
    });
    getSubmittedProposals(); // Load mocked proposals fixture
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it.skip('Validate menu options', () => {
    clickUserMenu();
    verifyUserMenuOverview(true);
    verifyUserMenuProposals(true);
    verifyUserMenuPanels(true);
    verifyUserMenuReviews(true);
    verifyUserMenuDecisions(true);
  });

  it.skip('Navigate using the dropdown menu', () => {
    clickUserMenuOverview();
    clickUserMenuPanels();
    clickUserMenuProposals();
  });

  it.skip('Display a list of proposals', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    clickPanelProposalsTab(); // (real getProposals api call would be made at this point and intercepted)
    // verifyMockedAPICall('@getSubmittedProposals');
    // verifyProposalOnGridIsVisible('The Milky Way View');
    // verifyProposalOnGridIsVisible('In a galaxy far, far away');
  });

  it('Display a list of reviewers', () => {
    clickUserMenuPanels(); // (real getReviewers api call would be made at this point and intercepted)
    clickFirstPanel();
    verifyReviewerOnGridIsVisible('Aisha');
  });

  it.skip('Add a reviewer to a panel', () => {
    clickUserMenuPanels();
    verifyMockedAPICall('@getReviewers');
    clickFirstPanel();
    // clickLinkedTickedBox(2);
    // verifyTickBoxIsSelected(2);
  });

  it.skip('Add a proposal to a panel', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    // clickPanelProposalsTab(); // (real getProposals api call would be made at this point and intercepted)
    // verifyMockedAPICall('@getSubmittedProposals');
    // clickLinkedTickedBox(0);
    // verifyTickBoxIsSelected(0);
  });
});
