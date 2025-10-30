import {
  addM2TargetUsingResolve,
  checkFieldDisabled,
  clearLocalStorage,
  clickDialogConfirm,
  clickFirstRowOfTargetTable,
  clickToAddTarget,
  createMock,
  enterTargetField,
  initializeUserNotLoggedIn,
  mockResolveTargetAPI,
  tabToEditTarget,
  updateTargetField,
  verifyFieldError,
  verifyTargetInTargetTable
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
    enterTargetField('name', 'M2'); // enter valid target name

    enterTargetField('skyDirectionValue1', '1:0:0'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue1', 'Input formatted incorrectly', true); //verify field error on coordinate field

    enterTargetField('skyDirectionValue2', '1:0:0'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue2', 'Input formatted incorrectly', true); //verify field error on coordinate field

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target coordinate fields are invalid
  });

  it('Verify add target button is disabled when target name field is invalid', () => {
    enterTargetField('skyDirectionValue1', '1:00:00'); // enter valid coordinate
    enterTargetField('skyDirectionValue2', '1:00:00'); // enter valid coordinate

    verifyFieldError('name', 'A value is required', true); //verify field error on name field, as is empty

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target name field is invalid
  });

  it('Verify target table reflects updated target', () => {
    mockResolveTargetAPI();

    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();

    //verify target in target table
    verifyTargetInTargetTable('M2', '21:33:27.0200', '-00:49:23.700', '-3.6');

    // edit target
    clickFirstRowOfTargetTable();
    tabToEditTarget();

    // update target fields
    updateTargetField('name', 'M1'); // enter new target name
    updateTargetField('skyDirectionValue1', '2:00:00'); // enter new coordinate
    updateTargetField('skyDirectionValue2', '2:00:00'); // enter new coordinate
    updateTargetField('velocityValue', '0'); // enter new velocity
    clickDialogConfirm();

    //verify updated target in target table
    verifyTargetInTargetTable('M1', '02:00:00', '02:00:00', '0');
  });
});

describe('Target entry validation - non science idea ', () => {
  before(() => {
    cy.window().then(win => {
      win.localStorage.setItem('cypress:proposalCreated', 'true');
    });
  });

  it('Verify name field error when target is duplicated', () => {
    mockResolveTargetAPI();

    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();

    //attempt to add target with the same name
    enterTargetField('name', 'M2'); // enter valid target name
    enterTargetField('skyDirectionValue1', '1:00:00'); // enter valid coordinate
    enterTargetField('skyDirectionValue2', '1:00:00'); // enter valid coordinate
    clickToAddTarget();

    //verify field error is present
    verifyFieldError('name', 'Failed to add target - check for duplicate', true); //verify field error on name field, as is empty
    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target name field is invalid

    //update target name which is not a duplicate
    enterTargetField('name', 'M1'); // enter valid target name

    //verify field error is present
    verifyFieldError('name', 'Failed to add target - check for duplicate', false); //verify field error on name field, as is empty

    checkFieldDisabled('addTargetButton', false); // verify add target button is now enabled
  });
});
