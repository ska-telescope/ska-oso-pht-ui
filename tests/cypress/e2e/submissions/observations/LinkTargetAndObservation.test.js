import {
  addM2TargetUsingResolve,
  clearLocalStorage,
  // clickListOfTargets,
  clickToAddTarget,
  clickToLinkTargetObservation,
  clickToNextPage,
  clickUnlinkedObservationInTable,
  createMock,
  createObservation,
  initializeUserNotLoggedIn,
  verifySensCalcStatus,
  mockResolveTargetAPI
} from '../../common/common.js';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();
  mockResolveTargetAPI();

  //add target
  addM2TargetUsingResolve();
  cy.wait('@mockResolveTarget');
  clickToAddTarget();

  //go to observation page
  clickToNextPage();

  //add observation
  createObservation();
});

afterEach(() => {
  clearLocalStorage();
});

// TODO Scenario needs to be re-defined based on a non-logged in user flow - see STAR-1904
describe('Link Target and Observation', () => {
  it.skip('Link a target and observation', { jiraKey: 'XTP-71406' }, () => {
    // TODO : Need to fix this so that we are able to navigate freely
    // clickUnlinkedObservationInTable();
    // clickToLinkTargetObservation();
    // verifySensCalcStatus();
  });
});
