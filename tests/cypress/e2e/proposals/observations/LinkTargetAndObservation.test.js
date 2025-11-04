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
} from '../../common/common';
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

describe('Link Target and Observation', () => {
  it('Link a target and observation', { jiraKey: 'XTP-71406' }, () => {
    // TODO : Need to fix this so that we are able to navigate freely
    // clickUnlinkedObservationInTable();
    // clickToLinkTargetObservation();
    // verifySensCalcStatus();
  });
});
