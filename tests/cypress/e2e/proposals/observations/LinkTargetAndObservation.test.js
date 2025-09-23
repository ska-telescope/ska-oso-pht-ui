import {
  addM2TargetUsingResolve,
  clearLocalStorage,
  clickListOfTargets,
  clickToAddTarget,
  clickToLinkTargetObservation,
  clickToNextPage,
  clickUnlinkedObservationInTable,
  createMock,
  createObservation,
  initializeUserNotLoggedIn,
  verifySensCalcStatus
} from '../../common/common';
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
