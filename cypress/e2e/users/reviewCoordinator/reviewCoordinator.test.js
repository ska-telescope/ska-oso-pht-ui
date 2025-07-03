import {
  clickAddPanel,
  clickUserMenuOverview,
  clickUserMenuPanels,
  // clickPanelButtonPanels,
  // clickPanelButtonProposals,
  // clickPanelButtonReviews,
  clickPanelMaintenanceButton,
  // clickReviewOverviewButton,
  clickUserMenuProposals,
  clickUserMenuReviews,
  initialize
} from '../../common/common';

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
});
