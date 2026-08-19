import {
  addM2TargetUsingResolve,
  checkFieldDisabled,
  clearLocalStorage,
  clickDialogConfirm,
  clickEdit,
  clickFirstRowOfTargetTable,
  clickStatusIconNav,
  clickToAddTarget,
  enterTargetField,
  mockResolveTargetAPI,
  pageConfirmed,
  updateTargetField,
  verifyFieldError,
  verifyInformationBannerText,
  verifyOsdDataMaxTargets,
  verifyTargetInTargetTable,
  createScienceIdeaSession
} from '../../common/common.js';
import { standardUser } from '../../users/users.js';

afterEach(() => {
  clearLocalStorage();
});

describe('Science Verification: Target entry validation', () => {
  beforeEach(() => {
    createScienceIdeaSession(standardUser);
    clickStatusIconNav('statusId4'); //Click to target page
    pageConfirmed('TARGET');
    checkFieldDisabled('addTargetButton', true); //verify add target button is disabled when all target fields are incomplete
  });

  it('SV: Verify add target button is disabled when target coordinate fields are invalid', () => {
    enterTargetField('name', 'M2'); // enter valid target name

    enterTargetField('skyDirectionValue1', '1:0:0'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue1', 'Input formatted incorrectly', true); //verify field error on coordinate field

    enterTargetField('skyDirectionValue2', '1:0:0'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue2', 'Input formatted incorrectly', true); //verify field error on coordinate field

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target coordinate fields are invalid
  });

  it('SV: Verify add target button is disabled when target name field is invalid', () => {
    enterTargetField('skyDirectionValue1', '1:00:00'); // enter valid coordinate
    enterTargetField('skyDirectionValue2', '1:00:00'); // enter valid coordinate

    verifyFieldError('name', 'A value is required', true); //verify field error on name field, as is empty

    checkFieldDisabled('addTargetButton', true); // verify add target button is disabled when target name field is invalid
  });

  it('SV: Verify submitting an edited target is disabled when name is invalid', () => {
    mockResolveTargetAPI();

    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();

    //verify target in target table
    verifyTargetInTargetTable('M2', '21:33:27.0200', '-00:49:23.700', '-3.6');

    // edit target
    clickFirstRowOfTargetTable();
    clickEdit();

    // update target name to invalid value
    updateTargetField('name', '  '); // enter invalid target name
    verifyFieldError('name', 'Please provide a target name', true); //verify field error on name field, as is invalid
    checkFieldDisabled('dialogConfirmationButton', true); // verify confirm button is disabled when target name field is invalid
  });

  it('SV: Verify submitting an edited target is disabled when ra is invalid', () => {
    mockResolveTargetAPI();

    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();

    //verify target in target table
    verifyTargetInTargetTable('M2', '21:33:27.0200', '-00:49:23.700', '-3.6');

    // edit target
    clickFirstRowOfTargetTable();
    clickEdit();

    // update target ra to invalid value
    updateTargetField('skyDirectionValue1', '1'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue1', 'Input formatted incorrectly', true); //verify field error on ra field, as is invalid
    checkFieldDisabled('dialogConfirmationButton', true); // verify confirm button is disabled
  });

  it('SV: Verify submitting an edited target is disabled when dec is invalid', () => {
    mockResolveTargetAPI();

    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();

    //verify target in target table
    verifyTargetInTargetTable('M2', '21:33:27.0200', '-00:49:23.700', '-3.6');

    // edit target
    clickFirstRowOfTargetTable();
    clickEdit();

    // update target dec to invalid value
    updateTargetField('skyDirectionValue2', '1'); // enter invalid coordinate
    verifyFieldError('skyDirectionValue2', 'Input formatted incorrectly', true); //verify field error on dec field, as is invalid
    checkFieldDisabled('dialogConfirmationButton', true); // verify confirm button is disabled
  });

  it('SV: Verify target table reflects updated target', () => {
    mockResolveTargetAPI();
    //add target
    addM2TargetUsingResolve();
    cy.wait('@mockResolveTarget');
    clickToAddTarget();

    //verify target in target table
    verifyTargetInTargetTable('M2', '21:33:27.0200', '-00:49:23.700', '-3.6');

    // edit target
    clickFirstRowOfTargetTable();
    clickEdit();

    // update target fields
    updateTargetField('name', 'M1'); // enter new target name
    updateTargetField('skyDirectionValue1', '2:00:00'); // enter new coordinate
    updateTargetField('skyDirectionValue2', '2:00:00'); // enter new coordinate
    updateTargetField('velocityValue', '0'); // enter new velocity
    clickDialogConfirm();

    //verify updated target in target table
    verifyTargetInTargetTable('M1', '02:00:00', '02:00:00', '0');

    //verify only one target is available for SV, as per OSD
    verifyOsdDataMaxTargets(1);
    verifyInformationBannerText('Only 1 target/object is allowed');
  });
});

describe('Proposal Flow: Target entry validation', () => {
  it('Proposal: Verify name field error when target is duplicated', function () {
    // No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification
    // one is seeded) - stub-only until one is, this isn't a test-code fix.
    this.skip();
  });
});
