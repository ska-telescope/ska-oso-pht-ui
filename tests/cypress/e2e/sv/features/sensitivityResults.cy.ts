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
// the label. The real calculator runs after a short debounce, so the label is given as long as a
// backend call to appear.
const result = (label: string) => cy.findByText(label, { timeout: 30000 }).parent().next();

// The results come from the sensitivity calculator, so they're only checked for having a value.
// Waits for them, as they're calculated after the change that triggers them.
const verifyResult = (label: string) =>
  result(label).should(($value) => expect($value.text()).to.match(/\d/));

describe('SV sensitivity results', () => {
  const proposal = buildSvContinuumProposal();

  const changeObservingMode = (mode: string) => {
    goToPage(detailsPage);
    select('Observing Mode', mode);
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

  it('recalculates the results when an observation field changes', () => {
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
    // Only spectral results have this row, so the old continuum ones can't pass for it
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

  // TODO: Fails intermittently on CI from a race in the app: Changing the observing mode can
  //  take a while to generate new observation due to a wait on calibration results to return.
  //  This means Data Product page can give incorrect information if it is opened before the
  //  observation is properly reset. Re-enable once form migration is complete and the mode
  //  change sets the observation without waiting on the calibrator lookup (BTN-3595).
  it.skip('shows that the results are not available in PST mode', () => {
    goToPage(targetPage);
    targetPage.fill(proposal);
    changeObservingMode('PST');

    goToPage(dataProductPage);
    cy.findByText(
      'PST mode is not currently supported within the Sensitivity Calculator application.',
      { timeout: 30000 }
    );
    cy.findByText(CONTINUUM_SENSITIVITY).should('not.exist');
  });

  it('shows that the results are not available for a solar system object target', () => {
    goToPage(targetPage);
    select('Coordinate Type', 'Solar System Object');
    select('Name', 'Mars');
    cy.findByRole('button', { name: 'Add Target' }).click();
    cy.findByRole('row', { name: /Mars/, timeout: 30000 });

    goToPage(dataProductPage);
    cy.findByText('Currently unavailable for non-sidereal objects');
    cy.findByText(CONTINUUM_SENSITIVITY).should('not.exist');
  });
});
