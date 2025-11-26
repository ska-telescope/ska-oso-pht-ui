import {
  clearLocalStorage,
  clickToObservationPage,
  createMock,
  createObservation,
  initializeUserNotLoggedIn,
  verifyUnlinkedObservationInTable
} from '../../common/common';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();
  clickToObservationPage();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Creating Observation', () => {
  it.skip('Create a default observation', { jiraKey: 'XTP-71406' }, () => {
    createObservation();
    verifyUnlinkedObservationInTable();
  });
});
