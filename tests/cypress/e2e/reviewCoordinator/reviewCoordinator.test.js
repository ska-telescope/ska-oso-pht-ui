import {
  clickAddPanel,
  clickUserMenuOverview,
  clickUserMenuPanels,
  enterPanelName,
  clickAddPanelEntry,
  verifyPanelCreatedAlertFooter,
  verifyPanelOnGridIsVisible,
  clickFirstPanel,
  verifyReviewerOnGridIsVisible,
  clickPanelProposalsTab,
  verifyProposalOnGridIsVisible,
  clickPanelButtonPanels,
  clickPanelButtonProposals,
  clickPanelButtonReviews,
  clickPanelMaintenanceButton,
  clickReviewOverviewButton,
  clickUserMenuProposals,
  clickUserMenuReviews,
  initialize,
  getSubmittedProposals,
  verifyMockedAPICall,
  getReviewers,
  clickLinkedTickdBox,
  verifyTickBoxIsSelected
} from '../common/common';

const panelName = Math.floor(Math.random() * 10000000).toString(); // name should be unique or endpoint will fail

describe('Review Coordinator', () => {
  beforeEach(() => {
    initialize();
    getSubmittedProposals(); // Load mocked proposals fixture
    getReviewers(); // Load mocked reviewers fixture
  });
  it('Navigate using the dropdown menu and then the overview panels', () => {
    clickUserMenuOverview();
    clickUserMenuProposals();
    clickUserMenuPanels();
    clickUserMenuReviews();
    clickUserMenuOverview();
    // clickPanelButtonPanels();
    // clickReviewOverviewButton();
    // clickPanelButtonReviews();
    // clickReviewOverviewButton();
    clickUserMenuProposals();
  });
  it('Creating a new review panel', () => {
    clickUserMenuPanels();
    clickAddPanel();
    enterPanelName(panelName);
    clickAddPanelEntry();
    verifyPanelCreatedAlertFooter();
  });
  it('Creating a new review panel, abandoned', () => {
    clickUserMenuPanels();
    clickAddPanel();
    clickPanelMaintenanceButton();
  });
  it('Display newly created panel', () => {
    clickUserMenuPanels();
    verifyPanelOnGridIsVisible(panelName);
  });
  it('Display a list of proposals', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    clickPanelProposalsTab(); // (real getProposals api call would be made at this point and intercepted)
    verifyMockedAPICall('@getSubmittedProposals');
    verifyProposalOnGridIsVisible('The Milky Way View');
    verifyProposalOnGridIsVisible('In a galaxy far, far away');
  });
  it('Display a list of reviewers', () => {
    clickUserMenuPanels(); // (real getReviewers api call would be made at this point and intercepted)
    verifyMockedAPICall('@getReviewers');
    clickFirstPanel();
    verifyReviewerOnGridIsVisible('Aisha');
  });
  it('Add a reviewer to a panel', () => {
    clickUserMenuPanels();
    verifyMockedAPICall('@getReviewers');
    clickFirstPanel();
    clickLinkedTickdBox(2);
    verifyTickBoxIsSelected(2);
  });
  it('Add a proposal to a panel', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    clickPanelProposalsTab(); // (real getProposals api call would be made at this point and intercepted)
    verifyMockedAPICall('@getSubmittedProposals');
    clickLinkedTickdBox(0);
    verifyTickBoxIsSelected(0);
  });
});
