import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import {
  buildSvContinuumProposal,
  buildSvSpectralProposal,
  SV_DEFAULTS
} from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import { createProposal, fillPages, goToPage } from '../../../support/editor/editorActions';
import { select } from '../../../support/editor/fields';
import { dataProductPage } from '../../../support/editor/pageObjects/dataProductPage';
import { detailsPage } from '../../../support/editor/pageObjects/detailsPage';
import { observationPage } from '../../../support/editor/pageObjects/observationPage';
import type { ObservingMode, ProposalFixture } from '../../../support/editor/types';

const selectObservingMode = (mode: ObservingMode) => {
  goToPage(detailsPage);
  select('Observing Mode', mode);
};

// Each case starts from a proposal whose observation and data product have been changed from
// their defaults, so that the reset shows
const CASES: { from: () => ProposalFixture; to: ObservingMode }[] = [
  { from: buildSvContinuumProposal, to: 'Continuum-Spectral' },
  { from: buildSvContinuumProposal, to: 'Spectral' },
  { from: buildSvContinuumProposal, to: 'PST' },
  { from: buildSvSpectralProposal, to: 'Continuum' }
];

describe('SV Details page', () => {
  afterEach(() => {
    clearLocalStorage();
  });

  CASES.forEach(({ from, to }) => {
    const proposal = from();
    const { observingMode } = proposal.details;

    it(`changing the observing mode from ${observingMode} to ${to} resets the observation and data product to the defaults of ${to}`, () => {
      createProposal(standardUser, SV_CYCLE, proposal);
      // New proposals are continuum
      if (observingMode !== 'Continuum') {
        selectObservingMode(observingMode);
      }
      fillPages([observationPage, dataProductPage], proposal);

      selectObservingMode(to);

      const { observation, dataProduct } = SV_DEFAULTS[to];
      const expected: ProposalFixture = {
        ...proposal,
        details: { ...proposal.details, observingMode: to },
        observation,
        ...(dataProduct && { dataProducts: { image: dataProduct } })
      };
      goToPage(observationPage);
      observationPage.verify(expected);
      goToPage(dataProductPage);
      if (dataProduct) {
        dataProductPage.verify(expected);
      } else {
        cy.findByText('All set!');
      }
    });
  });
});
