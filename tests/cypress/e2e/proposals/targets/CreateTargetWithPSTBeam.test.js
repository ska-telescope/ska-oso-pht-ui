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
  mockResolveTargetAPI,
  clickEdit,
  verifyMultipleBeamsRadioButtonSelected,
  clickMultipleBeamsRadioButton,
  clickToAddPSTBeam,
  mockResolveBeamAPI,
  addBeamUsingResolve,
  clickDialogConfirm,
  verifyBeamInTable
} from '../../common/common';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();
  mockResolveTargetAPI();
  mockResolveBeamAPI();

  //add target
  clickListOfTargets();
  addM2TargetUsingResolve();
  cy.wait('@mockResolveTarget');
  clickMultipleBeamsRadioButton(); //Select Multiple beams
  verifyMultipleBeamsRadioButtonSelected(); //verify Multiple beams is selected
  clickToAddPSTBeam();
  addBeamUsingResolve();
  cy.wait('@mockResolveBeam');
  clickDialogConfirm();
  verifyBeamInTable(); //confirm beam is in table before adding target
  clickToAddTarget();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Create Target with PST Beam', () => {
  it('Create target with pst beam, then link to observation', () => {
    clickToNextPage(); // go to observation page

    createObservation(); //add observation
    clickUnlinkedObservationInTable();
    clickToLinkTargetObservation(); //link target to observation
    verifySensCalcStatus(); //verify sens calc status
  });

  it("Verify on target edit, with pst beam, 'Multiple Beams' remains selected", () => {
    clickEdit();
    verifyMultipleBeamsRadioButtonSelected(); //verify Multiple beams is selected
    verifyBeamInTable(); //confirm previously added beam is in table
  });
});
