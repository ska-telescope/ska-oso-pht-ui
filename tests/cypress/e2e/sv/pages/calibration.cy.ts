import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import { buildSvContinuumProposal } from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import { createProposal, goToPage } from '../../../support/editor/editorActions';
import { calibrationPage } from '../../../support/editor/pageObjects/calibrationPage';
import { deleteTarget, targetPage } from '../../../support/editor/pageObjects/targetPage';

const NO_TARGET = 'Define a target to show calibration strategy';

const calibratorField = () => cy.findByRole('textbox', { name: 'Starting Calibrator' });

describe('SV Calibration page', () => {
  const proposal = buildSvContinuumProposal();

  afterEach(() => {
    clearLocalStorage();
  });

  it('shows the calibrator once a target is added, and an error once the target is deleted', () => {
    createProposal(standardUser, SV_CYCLE, proposal);

    goToPage(calibrationPage);
    cy.findByText(NO_TARGET);
    calibratorField().should('not.exist');

    // Adding the target links it to the observation, which chooses its calibrator
    goToPage(targetPage);
    targetPage.fill(proposal);
    goToPage(calibrationPage);
    calibratorField().should('have.value', proposal.calibration.calibrator);
    cy.findByText(NO_TARGET).should('not.exist');

    goToPage(targetPage);
    deleteTarget(proposal.target.name);
    goToPage(calibrationPage);
    cy.findByText(NO_TARGET);
    calibratorField().should('not.exist');
  });
});
