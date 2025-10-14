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
  verifyNoBeamRadioButtonSelected,
  clickEdit,
  clickToAddPSTBeam,
  clickDialogConfirm,
  addBeamUsingResolveOnTargetEdit,
  clickMultipleBeamsRadioButtonOnTargetEdit,
  verifyMultipleBeamsRadioButtonSelectedOnTargetEdit,
  mockResolveBeamAPI,
  clickConfirmButtonWithinPopup,
  verifyBeamInTableOnTargetEdit
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
  verifyNoBeamRadioButtonSelected(); //verify No beam is selected (default value)
  clickToAddTarget();
});

afterEach(() => {
  clearLocalStorage();
});

describe('Create Target with no PST Beam', () => {
  it('Create target with no pst beam, then link to observation', () => {
    clickToNextPage(); // go to observation page

    createObservation(); //add observation
    clickUnlinkedObservationInTable();
    clickToLinkTargetObservation(); //link target to observation
    verifySensCalcStatus(); //verify sens calc status
  });

  it("Verify on target edit, 'No Beam' remains selected", () => {
    clickEdit();
    verifyNoBeamRadioButtonSelected(); //verify No beam is selected (default value)
  });

  it("Verify on target edit, when No Beam' is selected, a PST Beam can be added ", () => {
    clickEdit();
    verifyNoBeamRadioButtonSelected(); //verify No beam is selected (default value)
    clickMultipleBeamsRadioButtonOnTargetEdit(); //Select Multiple beams
    verifyMultipleBeamsRadioButtonSelectedOnTargetEdit(); //verify Multiple beams is selected
    clickToAddPSTBeam();
    addBeamUsingResolveOnTargetEdit();
    cy.wait('@mockResolveBeam');
    clickConfirmButtonWithinPopup(); // confirm adding beam in popup
    verifyBeamInTableOnTargetEdit();
    clickDialogConfirm();
  });
});
