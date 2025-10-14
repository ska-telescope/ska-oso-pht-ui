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
  verifySensCalcStatus,
  mockResolveTargetAPI
} from '../../common/common';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();
  mockResolveTargetAPI();

  //add target
  clickListOfTargets();
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

describe('Create Target with PST Beam', () => {
  it('Create target with pst beam, then link to observation', () => {
    //TODO: Link obs verification, reinstate once scenario completed
    // clickUnlinkedObservationInTable();
    // clickToLinkTargetObservation();
    // verifySensCalcStatus();
  });
});
