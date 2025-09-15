import {
  addM2TargetUsingResolve,
  clearLocalStorage,
  clickAddMock,
  clickListOfTargets,
  clickToNextPage,
  clickToObservationPage,
  createMock,
  createObservation,
  initializeUserNotLoggedIn,
  verifyMockCreatedAlertFooter
} from '../common/common';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();

  //add target
  clickListOfTargets();
  addM2TargetUsingResolve();

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
    //TODO: Link target and observation
  });
});
