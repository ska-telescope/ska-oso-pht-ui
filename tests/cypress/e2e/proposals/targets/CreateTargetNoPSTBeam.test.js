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
  clickToPreviousPage,
  clickEdit
} from '../../common/common';
import { verifyContent } from '../../../fixtures/utils/cypress.js';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();
  mockResolveTargetAPI();

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

  it("Verify on target edit, with no pst beam, ' No Beam' remains selected", () => {
    clickEdit();
    verifyNoBeamRadioButtonSelected(); //verify No beam is selected (default value)
  });
});
