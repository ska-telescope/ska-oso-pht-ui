import { initializeUserNotLoggedIn, clearLocalStorage, verify } from '../../common/common';

describe('Guest User', () => {
  beforeEach(() => {
    initializeUserNotLoggedIn();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('Validate not signed in', () => {
    verify('loginButton');
  });
});
