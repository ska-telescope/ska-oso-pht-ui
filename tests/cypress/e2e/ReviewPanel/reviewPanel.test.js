import { defaultUser } from '../users/users.js';
import { initialize } from '../common/common.js';

describe('Review Panel', () => {
  beforeEach(() => {
    initialize(defaultUser);
  });
  /* Create review panel functionality currently unavailable
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
  */
});
