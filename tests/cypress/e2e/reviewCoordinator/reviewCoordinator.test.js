import {
  clickAddPanel,
  clickUserMenuOverview,
  clickUserMenuPanels,
  clickPanelButtonPanels,
  clickPanelButtonProposals,
  clickPanelButtonReviews,
  clickPanelMaintenanceButton,
  clickReviewOverviewButton,
  clickUserMenuProposals,
  clickUserMenuReviews,
  initialize
} from '../common/common';

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
    // TODO : Perhaps do some stuff in here ?
  });
  it('Creating a new review panel, abandoned', () => {
    clickUserMenuPanels();
    clickAddPanel();
    // TODO : Perhaps do some stuff in here ?
    clickPanelMaintenanceButton();
  });
  it('Display a list of proposals', () => {
    clickUserMenuPanels();
    clickAddPanel();
    // TODO : Perhaps do some stuff in here ?
    // TODO : once panel is created, check the proposals are displayed
  });
  it('Display a list of reviewers', () => {
    clickUserMenuPanels();
    clickAddPanel();
    // TODO : Perhaps do some stuff in here ?
    // TODO : once panel is created, check the reviewers are displayed
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
});
