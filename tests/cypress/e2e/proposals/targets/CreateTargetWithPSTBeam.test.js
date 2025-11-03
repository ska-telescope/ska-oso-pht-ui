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
  mockResolveTargetAPI,
  verifyMultipleBeamsRadioButtonSelected,
  clickMultipleBeamsRadioButton,
  clickToAddPSTBeam,
  mockResolveBeamAPI,
  addBeamUsingResolve,
  clickDialogConfirm,
  verifyBeamInTable,
  verifyBeamInTableOnTargetEdit,
  verifyMultipleBeamsInTable,
  verifyMultipleBeamsInTargetTable,
  verifyTargetWithBeamB0329InTargetTable,
  clickFirstRowOfTargetTable,
  verifyMultipleBeamsRadioButtonSelectedWithinPopup,
  tabToEditTarget
} from '../../common/common';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();
  mockResolveTargetAPI();
  mockResolveBeamAPI();
  //add target
  // clickListOfTargets();
  addM2TargetUsingResolve();
  cy.wait('@mockResolveTarget');
  clickMultipleBeamsRadioButton(); //Select Multiple beams
  verifyMultipleBeamsRadioButtonSelected(); //verify Multiple beams is selected
  clickToAddPSTBeam();
  addBeamUsingResolve('PSR B0329+54');
  cy.wait('@mockResolveBeam');
  clickDialogConfirm();
  verifyBeamInTable(); //confirm beam is in table before adding target
});

afterEach(() => {
  clearLocalStorage();
});

// TODO : Suppressed for now. Will need to be moved to the correct place eventually.

describe('Create Target with PST Beam', () => {
  it.skip('Create target with pst beam, then link to observation', () => {
    clickToAddTarget();
    clickToNextPage(); // go to observation page

    createObservation(); //add observation
    clickUnlinkedObservationInTable();
    clickToLinkTargetObservation(); //link target to observation
    verifySensCalcStatus(); //verify sens calc status
  });

  it.skip("Verify on target edit, with pst beam, 'Multiple Beams' remains selected", () => {
    clickToAddTarget();
    verifyTargetWithBeamB0329InTargetTable();
    clickFirstRowOfTargetTable();
    tabToEditTarget(); // use tab to click edit target from target table
    verifyMultipleBeamsRadioButtonSelectedWithinPopup(); //verify Multiple beams is selected
    verifyBeamInTableOnTargetEdit(); //confirm previously added beam is in table
  });

  it.skip('Add multiple beams', () => {
    clickToAddPSTBeam();
    addBeamUsingResolve('M2');
    cy.wait('@mockResolveTarget'); //Add M2 as second beam
    clickDialogConfirm();
    verifyMultipleBeamsInTable(); //verify both beams are in table
    clickToAddTarget();
    verifyMultipleBeamsInTargetTable(); //verify both beams are in main target table after adding target
  });
});
