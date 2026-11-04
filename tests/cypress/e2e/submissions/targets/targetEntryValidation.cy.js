import {
  checkAddTargetDisabled,
  addM2Target,
  checkFieldDisabled,
  clearLocalStorage,
  clickEdit,
  clickFirstRowOfTargetTable,
  clickStatusIconNav,
  clickToAddTarget,
  enterTargetField,
  pageConfirmed,
  updateTargetField,
  verifyTargetFieldError,
  verifyTargetInTargetTable,
  createScienceIdeaSession,
  createStandardProposalSession
} from '../../../support/common.js';
import { standardUser } from '../../../support/users.js';

afterEach(() => {
  clearLocalStorage();
});

describe('Science Verification: Target entry validation', () => {
  beforeEach(() => {
    createScienceIdeaSession(standardUser);
    clickStatusIconNav('statusId4'); //Click to target page
    pageConfirmed('TARGET');
    checkAddTargetDisabled(true); //verify add target button is disabled when all target fields are incomplete
  });

  it('SV: Verify add target button is disabled when target coordinate fields are invalid', () => {
    enterTargetField('Name', 'M2'); // enter valid target name

    enterTargetField('Right Ascension', '1:0:0'); // enter invalid coordinate
    verifyTargetFieldError('Right Ascension', 'Input formatted incorrectly', true); //verify field error on coordinate field

    enterTargetField('Declination', '1:0:0'); // enter invalid coordinate
    verifyTargetFieldError('Declination', 'Input formatted incorrectly', true); //verify field error on coordinate field

    checkAddTargetDisabled(true); // verify add target button is disabled when target coordinate fields are invalid
  });

  it('SV: Verify add target button is disabled when target name field is invalid', () => {
    enterTargetField('Right Ascension', '1:00:00'); // enter valid coordinate
    enterTargetField('Declination', '1:00:00'); // enter valid coordinate

    // The name has not been entered yet, so it shows no error, but the target can't be added
    checkAddTargetDisabled(true);
  });

  it('SV: Verify submitting an edited target is disabled when name is invalid', () => {
    //add target
    addM2Target();
    clickToAddTarget();

    //verify target in target table
    verifyTargetInTargetTable('M2', '21:33:27.0200', '-00:49:23.700', '-3.6');

    // edit target
    clickFirstRowOfTargetTable();
    clickEdit();

    // update target name to invalid value
    updateTargetField('Name', '  '); // enter invalid target name
    verifyTargetFieldError('Name', 'Please provide a target name', true); //verify field error on name field, as is invalid
    checkFieldDisabled('dialogConfirmationButton', true); // verify confirm button is disabled when target name field is invalid
  });

  it('SV: Verify submitting an edited target is disabled when ra is invalid', () => {
    //add target
    addM2Target();
    clickToAddTarget();

    //verify target in target table
    verifyTargetInTargetTable('M2', '21:33:27.0200', '-00:49:23.700', '-3.6');

    // edit target
    clickFirstRowOfTargetTable();
    clickEdit();

    // update target ra to invalid value
    updateTargetField('Right Ascension', '1'); // enter invalid coordinate
    verifyTargetFieldError('Right Ascension', 'Input formatted incorrectly', true); //verify field error on ra field, as is invalid
    checkFieldDisabled('dialogConfirmationButton', true); // verify confirm button is disabled
  });

  it('SV: Verify submitting an edited target is disabled when dec is invalid', () => {
    //add target
    addM2Target();
    clickToAddTarget();

    //verify target in target table
    verifyTargetInTargetTable('M2', '21:33:27.0200', '-00:49:23.700', '-3.6');

    // edit target
    clickFirstRowOfTargetTable();
    clickEdit();

    // update target dec to invalid value
    updateTargetField('Declination', '1'); // enter invalid coordinate
    verifyTargetFieldError('Declination', 'Input formatted incorrectly', true); //verify field error on dec field, as is invalid
    checkFieldDisabled('dialogConfirmationButton', true); // verify confirm button is disabled
  });
});

// No standard/PI-proposal cycle exists in the real backend yet (only a Science Verification one
// is seeded) - stub-only until one is, this isn't a test-code fix.
//
// Skipped via describe.skip() (not this.skip() inside a function(){} beforeEach) - see
// reviewScience.cy.js's comment: a function(){...this.skip()} test/hook sharing a spec with
// cy.intercept().as() elsewhere (here, createScienceIdeaSession in the SV describe above) reliably
// corrupts Cypress's command tracking. describe.skip() never invokes any of its hooks or tests at
// all, so it sidesteps that entirely.
describe.skip('Proposal Flow: Target entry validation', () => {
  beforeEach(() => {
    createStandardProposalSession(standardUser);
    clickStatusIconNav('statusId4'); //Click to target page
    pageConfirmed('TARGET');
    checkAddTargetDisabled(true); //verify add target button is disabled when all target fields are incomplete
  });

  it('Proposal: Verify name field error when target is duplicated', () => {
    //add target
    addM2Target();
    clickToAddTarget();

    //enter a target with the same name; it is flagged as it is typed, without clicking add
    enterTargetField('Name', 'M2'); // enter valid target name
    enterTargetField('Right Ascension', '1:00:00'); // enter valid coordinate
    enterTargetField('Declination', '1:00:00'); // enter valid coordinate

    //verify field error is present
    verifyTargetFieldError('Name', 'Failed to add target - check for duplicate', true); //verify field error on name field, as is empty
    checkAddTargetDisabled(true); // verify add target button is disabled when target name field is invalid

    //update target name which is not a duplicate
    enterTargetField('Name', 'M1-update'); // enter valid target name

    //verify field error is present
    verifyTargetFieldError('Name', 'Failed to add target - check for duplicate', false); //verify field error on name field, as is empty

    checkAddTargetDisabled(false); // verify add target button is now enabled
  });
});
