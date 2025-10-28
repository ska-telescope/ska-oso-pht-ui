import {
  addM2TargetUsingResolve,
  checkFieldDisabled,
  clearLocalStorage,
  clickToAddTarget,
  clickToObservationPage,
  createMock,
  createObservation,
  enterInvalidTargetCoordinate,
  enterTargetNameM2,
  enterValidTargetCoordinate,
  initializeUserNotLoggedIn,
  verifyFieldError,
  verifyUnlinkedObservationInTable
} from '../../common/common';
beforeEach(() => {
  initializeUserNotLoggedIn();
  createMock();

  checkFieldDisabled('addTargetButton', true); //verify add target button is disabled when all target fields are incomplete
});

afterEach(() => {
  clearLocalStorage();
});

describe('Target entry validation', () => {
  it.skip('Verify add target button is disabled when target coordinate fields are invalid', () => {
    enterTargetNameM2(); // enter valid target name

    enterInvalidTargetCoordinate('skyDirectionValue1'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue1', 'Input formatted incorrectly'); //verify field error on coordinate field

    enterInvalidTargetCoordinate('skyDirectionValue2'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue2', 'Input formatted incorrectly'); //verify field error on coordinate field

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target coordinate fields are invalid
  });

  it('Verify add target button is disabled when target name field is invalid', () => {
    enterValidTargetCoordinate('skyDirectionValue1'); // enter valid coordinate
    enterValidTargetCoordinate('skyDirectionValue2'); // enter valid coordinate

    verifyFieldError('name', 'A value is required'); //verify field error on name field, as is empty

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target name field is invalid
  });
});
