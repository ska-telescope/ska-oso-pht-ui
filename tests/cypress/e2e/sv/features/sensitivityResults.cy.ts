import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import { buildSvContinuumProposal } from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import { createProposal, goToPage } from '../../../support/editor/editorActions';
import { enter, section, select } from '../../../support/editor/fields';
import { dataProductPage } from '../../../support/editor/pageObjects/dataProductPage';
import { detailsPage } from '../../../support/editor/pageObjects/detailsPage';
import { observationPage } from '../../../support/editor/pageObjects/observationPage';
import { deleteTarget, targetPage } from '../../../support/editor/pageObjects/targetPage';

const NO_TARGET = 'Define a target to see sensitivity results';
const CONTINUUM_SENSITIVITY = 'Weighted continuum sensitivity';

// A result's value is shown next to its label, with nothing linking the two, so it's found from
// the label
const result = (label: string) => cy.findByText(label).parent().next();

// The results come from the sensitivity calculator, so they're only checked for having a value.
// Waits for them, as they're calculated after the change that triggers them.
const verifyResult = (label: string) =>
  result(label).should(($value) => expect($value.text()).to.match(/\d/));

describe('SV sensitivity results', () => {
  const proposal = buildSvContinuumProposal();

  const changeObservingMode = (mode: string) => {
    goToPage(detailsPage);
    select('Observing Mode', mode);
    // With a target, changing the mode links it to the new observation and recalculates
    cy.findByText('Observation setup auto-linked successfully.', { timeout: 30000 });
  };

  beforeEach(() => {
    createProposal(standardUser, SV_CYCLE, proposal);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('calculates the results once a target is added', () => {
    goToPage(dataProductPage);
    cy.findByText(NO_TARGET);

    goToPage(targetPage);
    targetPage.fill(proposal);
    goToPage(dataProductPage);
    result('Target name').should('contain.text', proposal.target.name);
    verifyResult(CONTINUUM_SENSITIVITY);
  });

  // TODO: Enable once fixed as part of BTN-3595. This test currently fails because the Observation
  //  page recalculates the results shortly after a change, but cancels that when it's left, so
  //  leaving straight after a change keeps the old results.
  it.skip('recalculates the results when an observation field changes', () => {
    goToPage(targetPage);
    targetPage.fill(proposal);
    goToPage(dataProductPage);
    verifyResult(CONTINUUM_SENSITIVITY);
    result(CONTINUUM_SENSITIVITY)
      .invoke('text')
      .then((before) => {
        // A longer integration gives a better sensitivity
        goToPage(observationPage);
        enter(section('Array Setup').findByRole('textbox'), '4');

        goToPage(dataProductPage);
        result(CONTINUUM_SENSITIVITY).should(($value) => {
          expect($value.text()).to.match(/\d/);
          expect($value.text()).not.to.equal(before);
        });
      });
  });

  it('recalculates the results when the observing mode changes', () => {
    goToPage(targetPage);
    targetPage.fill(proposal);
    goToPage(dataProductPage);
    verifyResult(CONTINUUM_SENSITIVITY);

    changeObservingMode('Spectral');
    goToPage(dataProductPage);
    verifyResult('Weighted spectral sensitivity');
    cy.findByText(CONTINUUM_SENSITIVITY).should('not.exist');
  });

  it('clears the results when the target is deleted', () => {
    goToPage(targetPage);
    targetPage.fill(proposal);
    goToPage(dataProductPage);
    verifyResult(CONTINUUM_SENSITIVITY);

    goToPage(targetPage);
    deleteTarget(proposal.target.name);
    goToPage(dataProductPage);
    cy.findByText(NO_TARGET);
    cy.findByText(CONTINUUM_SENSITIVITY).should('not.exist');
  });

  it('shows that the results are not available in PST mode', () => {
    goToPage(targetPage);
    targetPage.fill(proposal);
    changeObservingMode('PST');

    goToPage(dataProductPage);
    cy.findByText(
      'PST mode is not currently supported within the Sensitivity Calculator application.'
    );
    cy.findByText(CONTINUUM_SENSITIVITY).should('not.exist');
  });

  it('shows that the results are not available for a solar system object target', () => {
    goToPage(targetPage);
    select('Coordinate Type', 'Solar System Object');
    select('Name', 'Mars');
    cy.findByRole('button', { name: 'Add Target' }).click();
    cy.findByText('Target added and auto-linked successfully.', { timeout: 30000 });

    goToPage(dataProductPage);
    cy.findByText('Currently unavailable for non-sidereal objects');
    cy.findByText(CONTINUUM_SENSITIVITY).should('not.exist');
  });
});
