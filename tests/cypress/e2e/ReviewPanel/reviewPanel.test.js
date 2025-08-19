import {
  clickAddPanel,
  clickUserMenuOverview,
  clickUserMenuPanels,
  clickPanelButtonPanels,
  clickPanelButtonProposals,
  clickPanelButtonReviews,
  clickReviewOverviewButton,
  clickUserMenuProposals,
  clickUserMenuReviews,
  initialize,
  clickPanelMaintenanceButton,
  enterPanelName,
  clickAddPanelEntry,
  checkFieldDisabled
} from '../common/common';

describe('Review Panel', () => {
  beforeEach(() => {
    initialize();
  });
  //TODO: Create review panel functionality currently unavailable
  it.skip('Create a new review panel', () => {
    clickUserMenuPanels();
    clickAddPanel();
    enterPanelName();
    clickAddPanelEntry();
    //Add verification once list is populated
  });

  it.skip('Verify add button is disabled, when panel name field is incomplete', () => {
    clickUserMenuPanels();
    clickAddPanel();
    checkFieldDisabled('addPanelButton', true);
  });
});
