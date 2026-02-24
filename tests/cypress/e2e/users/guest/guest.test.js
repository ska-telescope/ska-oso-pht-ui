import { initializeUserNotLoggedIn, clearLocalStorage, verify } from '../../common/common';

describe('Guest User', () => {
  beforeEach(() => {
    initializeUserNotLoggedIn();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate user has not yet signed in, log in button is present', () => {
    verify('loginButton');
  });
});
