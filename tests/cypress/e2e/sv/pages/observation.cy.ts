import { clearLocalStorage } from '../../../support/common';
import { standardUser } from '../../../support/users';
import { buildSvPstProposal } from '../../../support/editor/data/sv';
import { SV_CYCLE } from '../../../support/editor/cycles';
import { createProposal, goToPage, step } from '../../../support/editor/editorActions';
import { select } from '../../../support/editor/fields';
import { dataProductPage } from '../../../support/editor/pageObjects/dataProductPage';
import { detailsPage } from '../../../support/editor/pageObjects/detailsPage';
import { observationPage } from '../../../support/editor/pageObjects/observationPage';

// The data product fields and polarisations each PST mode shows. Pulsar timing has neither.
const PST_DATA_PRODUCTS: Record<string, { fields: string[]; polarisations: string[] }> = {
  'Flow Through': { fields: ['Bit Depth'], polarisations: ['X', 'Y'] },
  'Detected Filterbank': {
    fields: [
      'Output frequency resolution',
      'Output sampling interval',
      'Bit Depth',
      'Dispersion Measure',
      'Rotation Measure'
    ],
    polarisations: ['I', 'Q', 'U', 'V']
  },
  'Pulsar Timing': { fields: [], polarisations: [] }
};

const ALL_FIELDS = [...new Set(Object.values(PST_DATA_PRODUCTS).flatMap((dp) => dp.fields))];
const ALL_POLARISATIONS = [
  ...new Set(Object.values(PST_DATA_PRODUCTS).flatMap((dp) => dp.polarisations))
];

// TODO: Remove once checkboxes and dropdowns can be found with findByRole
const label = (text: string) => cy.contains('label', new RegExp(`^${text}( \\*)?$`));

describe('SV Observation page', () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it('changing the PST mode changes the fields shown on the Data Product page', () => {
    createProposal(standardUser, SV_CYCLE, buildSvPstProposal());
    goToPage(detailsPage);
    select('Observing Mode', 'PST');

    // Goes through every mode, starting from the default, pulsar timing
    ['Flow Through', 'Detected Filterbank', 'Pulsar Timing'].forEach((pstMode) =>
      step(`PST mode ${pstMode}`, () => {
        goToPage(observationPage);
        select('PST Mode', pstMode);

        goToPage(dataProductPage);
        const { fields, polarisations } = PST_DATA_PRODUCTS[pstMode];
        ALL_FIELDS.forEach((field) =>
          label(field).should(fields.includes(field) ? 'exist' : 'not.exist')
        );
        ALL_POLARISATIONS.forEach((p) =>
          label(p).should(polarisations.includes(p) ? 'exist' : 'not.exist')
        );
        if (pstMode === 'Pulsar Timing') {
          cy.findByText('All set!');
        }
      })
    );
  });
});
