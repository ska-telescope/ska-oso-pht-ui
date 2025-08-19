import { reviewerAdmin } from '../users';
import {
  clickLoginUser,
  clickAddPanel,
  clickUserMenuPanels,
  enterPanelName,
  clickAddPanelEntry,
  verifyPanelCreatedAlertFooter,
  verifyPanelOnGridIsVisible,
  clickFirstPanel,
  verifyReviewerOnGridIsVisible,
  clickPanelProposalsTab,
  verifyProposalOnGridIsVisible,
  clickPanelMaintenanceButton,
  clickUserMenuProposals,
  initialize,
  getSubmittedProposals,
  verifyMockedAPICall,
  getReviewers,
  clickLinkedTickedBox,
  verifyTickBoxIsSelected
} from '../../common/common';

const panelName = Math.floor(Math.random() * 10000000).toString(); // name should be unique or endpoint will fail

describe('Review Administrator', () => {
  beforeEach(() => {
    initialize();
    cy.window().then(win => {
      win.localStorage.setItem('USE_LOCAL_DATA', 'true');
    });
    cy.mockLoginButton(reviewerAdmin);
    getSubmittedProposals(); // Load mocked proposals fixture
    getReviewers(); // Load mocked reviewers fixture
    clickLoginUser();
  });

  it('Navigate using the dropdown menu', () => {
    // clickUserMenuOverview();
    clickUserMenuPanels();
    clickUserMenuProposals();
  });

  it.skip('Creating a new review panel', () => {
    clickUserMenuPanels();
    clickAddPanel();
    enterPanelName(panelName);
    clickAddPanelEntry();
    verifyPanelCreatedAlertFooter();
  });

  it.skip('Creating a new review panel, abandoned', () => {
    clickUserMenuPanels();
    clickAddPanel();
    clickPanelMaintenanceButton();
  });
  it.skip('Display newly created panel', () => {
    clickUserMenuPanels();
    verifyPanelOnGridIsVisible(panelName);
  });

  it.skip('Display a list of proposals', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    clickPanelProposalsTab(); // (real getProposals api call would be made at this point and intercepted)
    verifyMockedAPICall('@getSubmittedProposals');
    verifyProposalOnGridIsVisible('The Milky Way View');
    verifyProposalOnGridIsVisible('In a galaxy far, far away');
  });
  it.skip('Display a list of reviewers', () => {
    clickUserMenuPanels(); // (real getReviewers api call would be made at this point and intercepted)
    verifyMockedAPICall('@getReviewers');
    clickFirstPanel();
    verifyReviewerOnGridIsVisible('Aisha');
  });
  it.skip('Add a reviewer to a panel', () => {
    clickUserMenuPanels();
    verifyMockedAPICall('@getReviewers');
    clickFirstPanel();
    clickLinkedTickedBox(2);
    verifyTickBoxIsSelected(2);
  });
  it.skip('Add a proposal to a panel', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    clickPanelProposalsTab(); // (real getProposals api call would be made at this point and intercepted)
    verifyMockedAPICall('@getSubmittedProposals');
    clickLinkedTickedBox(0);
    verifyTickBoxIsSelected(0);
  });
});
