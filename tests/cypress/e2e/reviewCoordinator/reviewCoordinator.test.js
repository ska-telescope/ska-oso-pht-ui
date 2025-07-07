import {
  clickAddPanel,
  clickUserMenuOverview,
  clickUserMenuPanels,
  enterPanelName,
  clickAddPanelEntry,
  verifyPanelCreatedAlertFooter,
  verifyFirstPanelOnLandingPageIsVisible,
  getPanelId,
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
    verifyFirstPanelOnLandingPageIsVisible(panelName);
  });
  it('Display a list of proposals', () => {
    clickUserMenuPanels();
    // TODO : click on a panel
    // TODO : click on the proposals tab
    // TODO : check the proposals are displayed
  });
  /*
  it('Display a list of reviewers', () => {
    clickUserMenuPanels();
    // TODO : click on a panel
    // TODO : click on the proposals tab
    // TODO : check the reviewers are displayed
  });
  it('Add a reviewer to a panel', () => {
    clickUserMenuPanels();
    clickAddPanel();
    // TODO : Perhaps do some stuff in here ?
    // TODO : once panel is created, add a reviewer
  });
  it('Add a proposal to a panel', () => {
    clickUserMenuPanels();
    clickAddPanel();
    // TODO : Perhaps do some stuff in here ?
    // TODO : once panel is created, add a proposal
  });
  */
});
