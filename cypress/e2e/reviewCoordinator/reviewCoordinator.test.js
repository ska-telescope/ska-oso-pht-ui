import { clickLoginUser, clickMenuOptionPanels, initialize, pageConfirmed } from '../common/common';

describe('Review Coordinator', () => {
  beforeEach(() => {
    initialize();
  });
  it('Creating a new review panel', () => {
    clickLoginUser();
    clickMenuOptionPanels();
    pageConfirmed('Panels');
  });
});
