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
  getProposals,
  verifyMockedAPICall
} from '../common/common';

const panelName = Math.floor(Math.random() * 10000000).toString(); // name should be unique or endpoint will fail

describe('Review Coordinator', () => {
  beforeEach(() => {
    initialize();
    getProposals(); // Load mocked proposals fixture
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
    clickPanelProposalsTab();
    verifyProposalOnGridIsVisible('The Milky Way View');
    verifyProposalOnGridIsVisible('In a galaxy far, far away');
  });
  it('Display a list of reviewers', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    verifyReviewerOnGridIsVisible('Aisha');
    // TODO mock reviewer list API call similar to proposals
  });
  it('Add a reviewer to a panel', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    // TODO : select a reviewer
  });
  it('Add a proposal to a panel', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    clickPanelProposalsTab(); // (real getProposals api call would be made at this point and intercepted)
    verifyMockedAPICall('@getProposals');
    verifyProposalOnGridIsVisible('The Milky Way View');
    // TODO: select a proposal
  });
});
