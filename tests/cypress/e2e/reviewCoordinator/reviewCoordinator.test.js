import {
  clickAddPanel,
  clickUserMenuOverview,
  clickUserMenuPanels,
  enterPanelName,
  clickAddPanelEntry,
  verifyPanelCreatedAlertFooter,
  verifyFirstPanelOnGridIsVisible,
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
  initialize
} from '../common/common';

const panelName = Math.floor(Math.random() * 10000000).toString(); // name should be unique or endpoint will fail

describe('Review Coordinator', () => {
  beforeEach(() => {
    initialize();
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
    clickAddPanel();
    clickPanelMaintenanceButton();
  });
  it('Display newly created panel', () => {
    clickUserMenuPanels();
    verifyFirstPanelOnGridIsVisible(panelName);
  });
  it('Display a list of proposals', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    // TODO : check the proposals are displayed (we need to add or mock proposals first)
  });
  it('Display a list of reviewers', () => {
    clickUserMenuPanels();
    clickFirstPanel();
    verifyReviewerOnGridIsVisible('Aisha');
    // TODO : check the reviewers are displayed
  });
  it('Add a reviewer to a panel', () => {
    clickUserMenuPanels();
    clickAddPanel();
    // TODO : Perhaps do some stuff in here ?
    // TODO : add a reviewer
  });
  it('Add a proposal to a panel', () => {
    clickUserMenuPanels();
    clickAddPanel();
    // TODO : Perhaps do some stuff in here ?
    // TODO : add a proposal
  });
});
