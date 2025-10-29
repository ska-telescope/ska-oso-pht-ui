import {
  addM2TargetUsingResolve,
  checkFieldDisabled,
  clearLocalStorage,
  clickToAddTarget,
  createMock,
  enterTargetCoordinate,
  enterTargetName,
  initializeUserNotLoggedIn,
  mockResolveTargetAPI,
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
    verifyFieldError('skyDirectionValue1', 'Input formatted incorrectly', true); //verify field error on coordinate field

    enterTargetCoordinate('skyDirectionValue2', '1:0:0'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue2', 'Input formatted incorrectly', true); //verify field error on coordinate field

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target coordinate fields are invalid
  });

  it('Verify add target button is disabled when target name field is invalid', () => {
    enterTargetCoordinate('skyDirectionValue1', '1:00:00'); // enter valid coordinate
    enterTargetCoordinate('skyDirectionValue2', '1:00:00'); // enter valid coordinate

    verifyFieldError('name', 'A value is required', true); //verify field error on name field, as is empty

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target name field is invalid
  });

  it('Verify name field error when target is duplicated', () => {
    mockResolveTargetAPI();

    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();

    //attempt to add target with the same name
    enterTargetName('name', 'M2'); // enter valid target name
    enterTargetCoordinate('skyDirectionValue1', '1:00:00'); // enter valid coordinate
    enterTargetCoordinate('skyDirectionValue2', '1:00:00'); // enter valid coordinate
    clickToAddTarget();

    //verify field error is present
    verifyFieldError('name', 'Failed to add target - check for duplicate', true); //verify field error on name field, as is empty
    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target name field is invalid

    //update target name which is not a duplicate
    enterTargetName('name', 'M1'); // enter valid target name

    //verify field error is present
    verifyFieldError('name', 'Failed to add target - check for duplicate', false); //verify field error on name field, as is empty

    checkFieldDisabled('addTargetButton', false); // verify add target button is now enabled
  });
});
