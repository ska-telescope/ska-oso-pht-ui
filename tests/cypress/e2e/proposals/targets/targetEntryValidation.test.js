import {
  checkFieldDisabled,
  clearLocalStorage,
  createMock,
  enterTargetCoordinate,
  enterTargetName,
  initializeUserNotLoggedIn,
  verifyFieldError
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
  it('Verify add target button is disabled when target coordinate fields are invalid', () => {
    enterTargetName('name', 'M2'); // enter valid target name

    enterTargetCoordinate('skyDirectionValue1', '1:0:0'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue1', 'Input formatted incorrectly'); //verify field error on coordinate field

    enterTargetCoordinate('skyDirectionValue2', '1:0:0'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue2', 'Input formatted incorrectly'); //verify field error on coordinate field

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target coordinate fields are invalid
  });

  it('Verify add target button is disabled when target name field is invalid', () => {
    enterTargetCoordinate('skyDirectionValue1', '1:00:00'); // enter valid coordinate
    enterTargetCoordinate('skyDirectionValue2', '1:00:00'); // enter valid coordinate

    verifyFieldError('name', 'A value is required'); //verify field error on name field, as is empty

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target name field is invalid
  });
});
