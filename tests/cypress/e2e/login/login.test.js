import {
  initialize,
  clickMockLoginCheckBox, clickSignIn
} from '../common/common';

describe('Login', () => {
  beforeEach(() => {
    initialize();
  });
  it('Login', () => {
    clickMockLoginCheckBox();
    clickSignIn();
  });
});
