import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import { buildSvContinuumProposal } from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import { createProposal, goToPage } from '../../../support/editor/editorActions';
import { select } from '../../../support/editor/fields';
import { detailsPage } from '../../../support/editor/pageObjects/detailsPage';
import { targetPage } from '../../../support/editor/pageObjects/targetPage';
import type { ObservationInfo } from '../../../../../src/generated/models/observation-info';

let saves = 0;

// Saves the proposal and returns the observation_info of what the app sent to the backend.
const saveProposal = () => {
  const alias = `save${++saves}`;
  cy.intercept('PUT', '**/pht/prsls/*').as(alias);
  cy.findByRole('button', { name: 'Save' }).click();
  return cy.wait(`@${alias}`).then(({ request, response }) => {
    expect(response?.statusCode).to.equal(200);
    return request.body.observation_info as ObservationInfo;
  });
};

const verifyLinked = (info: ObservationInfo) => {
  const observationId = info.observation_sets?.[0]?.observation_set_id;
  expect(info.targets).to.have.length(1);
  expect(info.observation_sets).to.have.length(1);
  expect(info.result_details).to.have.length(1);

  const link = info.result_details?.[0];
  expect(link?.target_ref).to.equal(info.targets?.[0]?.target_id);
  expect(link?.observation_set_ref).to.equal(observationId);
  // The linked data product belongs to the linked observation
  const dataProduct = info.data_product_sdps?.find(
    (dp) => dp.data_product_id === link?.data_product_ref
  );
  expect(dataProduct?.observation_set_ref).to.equal(observationId);

  expect(info.calibration_strategy).to.have.length(1);
  expect(info.calibration_strategy?.[0]?.observation_set_ref).to.equal(observationId);
};

describe('SV auto-linking', () => {
  const proposal = buildSvContinuumProposal();

  beforeEach(() => {
    createProposal(standardUser, SV_CYCLE, proposal);
    goToPage(targetPage);
    targetPage.fill(proposal);
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it('links an added target to the observation and data product', () => {
    saveProposal().then(verifyLinked);
  });

  it('removes the link when the target is deleted', () => {
    cy.findByRole('row', { name: new RegExp(proposal.target.name) })
      .findByRole('button', { name: 'Delete the target' })
      .click();
    cy.findByRole('dialog').findByRole('button', { name: 'Confirm' }).click();

    saveProposal().then((info) => {
      expect(info.targets ?? []).to.have.length(0);
      expect(info.result_details ?? []).to.have.length(0);
      expect(info.calibration_strategy ?? []).to.have.length(0);
    });
  });

  it('links the target to the new observation and data product when the observing mode changes', () => {
    saveProposal().then((before) => {
      const oldObservationId = before.observation_sets?.[0]?.observation_set_id;

      goToPage(detailsPage);
      select('Observing Mode', 'Spectral');
      cy.findByText('Observation setup auto-linked successfully.', { timeout: 30000 });

      saveProposal().then((after) => {
        verifyLinked(after);
        expect(after.observation_sets?.[0]?.observation_set_id).not.to.equal(oldObservationId);
      });
    });
  });
});
