import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import { buildSvContinuumProposal } from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import { createProposal, goToPage } from '../../../support/editor/editorActions';
import { enter } from '../../../support/editor/fields';
import {
  addTargetByResolving,
  deleteTarget,
  targetPage
} from '../../../support/editor/pageObjects/targetPage';

const addTargetButton = () => cy.findByRole('button', { name: 'Add Target' });

// The target table is replaced by a message when there are no targets, so rows are found without
// it
const targetRow = (name: string) => cy.findByRole('row', { name: new RegExp(name) });

const LIMIT_REACHED = 'Only 1 target/object is allowed for this Science Verification Idea call.';

describe('SV Target page', () => {
  const proposal = buildSvContinuumProposal();
  const { target } = proposal;

  beforeEach(() => {
    createProposal(standardUser, SV_CYCLE, proposal);
    goToPage(targetPage);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  // features/autoLinking.cy.ts checks what the target is linked to
  it('adds a target and allows no more targets', () => {
    // Waits for the target to be added and auto-linked
    targetPage.fill(proposal);
    targetPage.verify(proposal);

    // SV cycles allow a single target
    cy.findByText(LIMIT_REACHED);
    addTargetButton().should('be.disabled');
  });

  it('updates the target table when a target is edited', () => {
    targetPage.fill(proposal);

    targetRow(target.name).findByRole('button', { name: 'Edit the target' }).click();
    cy.findByRole('dialog').within(() => {
      enter(cy.findByRole('textbox', { name: 'Name' }), 'Edited target');
      enter(cy.findByRole('textbox', { name: 'Redshift' }), '1.5');
      cy.findByRole('button', { name: 'Confirm' }).click();
    });

    targetRow('Edited target').within(() => {
      cy.findByText(target.ra);
      cy.findByText(target.dec);
      cy.findByText('1.5');
    });
    targetRow(target.name).should('not.exist');
  });

  it('removes the target and allows adding another when the target is deleted', () => {
    targetPage.fill(proposal);

    deleteTarget(target.name);

    targetRow(target.name).should('not.exist');
    cy.findByText(LIMIT_REACHED).should('not.exist');
    // A new target can be added once its fields are filled in
    targetPage.fill(proposal);
    targetPage.verify(proposal);
  });

  // This spec is the only one that resolves, because the resolver depends on external services
  // that are sometimes down. The other specs type the coordinates in.
  // TODO: Enable once the target lookup service the resolver uses is back up
  it.skip('adds a target with the coordinates found by resolving its name', () => {
    addTargetByResolving(target);
    targetPage.verify(proposal);
  });

  // TODO: This should be changed in BTN-3593 to look for the error pop-up rather than
  //  error attached to the target name field
  // TODO: Enable once the target lookup service the resolver uses is back up
  it.skip('shows an error when the target name cannot be resolved', () => {
    enter(cy.findByRole('textbox', { name: 'Name' }), 'Cypress unknown object');
    cy.findByRole('button', { name: 'Resolve' }).click();

    // Resolving goes to external services, which can be slow
    cy.findByText('Object not found in SIMBAD, NED or VizieR', { timeout: 40000 });
    targetRow('Cypress unknown object').should('not.exist');
  });

  // TODO: Enable once fixed as part of BTN-3593 where we should change
  //  the app to show the backend error message instead of our own one.
  it.skip('shows an error when the resolver is unavailable', () => {
    // Stubbed, so the outage happens on every run
    cy.intercept('GET', '**/coordinates/**', { statusCode: 500 });
    enter(cy.findByRole('textbox', { name: 'Name' }), target.name);
    cy.findByRole('button', { name: 'Resolve' }).click();

    cy.findByText(
      'Error occurred while resolving target. Please try again or manually input target details.'
    );
    targetRow(target.name).should('not.exist');
  });

  // Galactic coordinates aren't implemented yet
  it.skip('adds a target with galactic coordinates');
});
