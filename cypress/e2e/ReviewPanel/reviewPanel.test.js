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
  checkFieldDisabled,
  verifyWarning
} from '../common/common';

describe('XTP-83987 Review Panel', () => {
  beforeEach(() => {
    initialize();
  });
  it('Create a new review panel', () => {
    clickUserMenuPanels();
    clickAddPanel();
    enterPanelName();
    clickAddPanelEntry();
    //Add verification once list is populated
  });

  it('Verify add button is disabled, when panel name field is incomplete', () => {
    clickUserMenuPanels();
    clickAddPanel();
    checkFieldDisabled('addPanelButton', true);
  });
});
