import {
  addM2TargetUsingResolve,
  clearLocalStorage,
  clickAddMock,
  clickListOfTargets,
  clickToAddTarget,
  clickToLinkTargetObservation,
  clickToNextPage,
  clickToObservationPage,
  clickUnlinkedObservationInTable,
  createMock,
  createObservation,
  initializeUserNotLoggedIn,
  verifyMockCreatedAlertFooter,
  verifySensCalcStatus
} from '../common/common';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();

  //add target
  clickListOfTargets();
  addM2TargetUsingResolve();
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
    clickUnlinkedObservationInTable();
    clickToLinkTargetObservation();
    verifySensCalcStatus();
  });
});
