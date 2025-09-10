import {
  clearLocalStorage,
  createObservation,
  createStandardProposal,
  initializeUserNotLoggedIn
} from '../common/common';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createStandardProposal();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Creating Observation', () => {
  it('Create a default observation', { jiraKey: 'XTP-71406' }, () => {
    createObservation();
  });
});
