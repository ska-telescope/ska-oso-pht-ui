import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import EffectiveResolutionField from './EffectiveResolution';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { viewPort } from '../../../utils/testing/cypress';
import { TYPE_ZOOM } from '../../../utils/constants';
import DATA from '../../../../cypress/fixtures/observations.json';

const TEST_LABEL = 'TEST LABEL';

function mountDefault() {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme('light')}>
        <CssBaseline />
        <EffectiveResolutionField
          frequency={1}
          frequencyUnits={1}
          observingBand={1}
          observationType={1}
          spectralAveraging={1}
          spectralResolution={'123 MHz'}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

function mount(
  frequency: number,
  frequencyUnits: number,
  observingBand: number,
  observationType: number,
  spectralAveraging: number,
  spectralResolution: string
) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme('light')}>
        <CssBaseline />
        <EffectiveResolutionField
          frequency={frequency}
          frequencyUnits={frequencyUnits}
          label={TEST_LABEL}
          observingBand={observingBand}
          observationType={observationType}
          setValue={cy.stub().as('action')}
          spectralAveraging={spectralAveraging}
          spectralResolution={spectralResolution}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

const Averaging = (inValue: { spectralAveraging: number }) => {
  return inValue.spectralAveraging + '...';
};

const Band = (inValue: { observingBand: number }) => {
  switch (inValue.observingBand) {
    case 1:
      return 'MID 1.';
    case 2:
      return 'MID 2.';
    case 3:
      return 'MID 5a';
    case 4:
      return 'MID 5b';
    default:
      return 'LOW...';
  }
};

const SR = (inValue: { spectralResolution }) => {
  return inValue.spectralResolution;
};

const Type = (inValue: { observationType: number }) => {
  return inValue.observationType === TYPE_ZOOM ? 'Zoom' : 'Cont';
};

const Properties = rec => {
  return `${Band(rec)} | ${Type(rec)} | ${Averaging(rec)} | ${SR(rec)}`;
};

describe('<EffectiveResolution />', () => {
  it(`Band.. | Type. | Avg | Spectral => Results`, () => {
    mountDefault();
  });
  for (const rec of DATA) {
    it(`${Properties(rec)} => ${rec.effectiveResolution}`, () => {
      mount(
        rec.frequency,
        rec.frequencyUnits,
        rec.observingBand,
        rec.observationType,
        rec.spectralAveraging,
        rec.spectralResolution
      );
      cy.get('#effectiveResolution').should('have.value', rec.effectiveResolution);
    });
  }
});
