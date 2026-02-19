import {
  clearLocalStorage,
  clickToObservationPage,
  createMock,
  createObservation,
  initializeUserNotLoggedIn,
  verifyUnlinkedObservationInTable
} from '../../common/common.js';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();
  clickToObservationPage();
});

afterEach(() => {
  clearLocalStorage();
});

// TODO Scenario needs to be re-defined based on a non-logged in user flow - see STAR-1904
describe('Creating Observation', () => {
  it.skip('Create a default observation', { jiraKey: 'XTP-71406' }, () => {
    createObservation();
    verifyUnlinkedObservationInTable();
  });
});
