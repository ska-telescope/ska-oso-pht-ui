import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import SpectralResolutionField from './SpectralResolution';
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
        <SpectralResolutionField
          bandWidth={1}
          bandWidthUnits={1}
          frequency={1}
          frequencyUnits={1}
          observingBand={1}
          observationType={1}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

function mount(
  observingBand: number,
  observationType: number,
  bandWidth: number,
  bandWidthUnits: number,
  frequency: number,
  frequencyUnits: number
) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme('light')}>
        <CssBaseline />
        <SpectralResolutionField
          bandWidth={bandWidth}
          bandWidthUnits={bandWidthUnits}
          frequency={frequency}
          frequencyUnits={frequencyUnits}
          label={TEST_LABEL}
          observingBand={observingBand}
          observationType={observationType}
          setValue={cy.stub().as('action')}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

const BW = (inValue: { bandWidth: number }) => {
  return inValue.bandWidth + '...';
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

const FQ = (inValue: { frequency: number; frequencyUnits: number; observingBand: number }) => {
  const arr = ['', 'GHz', 'MHz', 'kHz', 'Hz'];
  return inValue.frequency + ' ' + arr[inValue.frequencyUnits];
};

const Type = (inValue: { observationType: number }) => {
  return inValue.observationType === TYPE_ZOOM ? 'Zoom' : 'Cont';
};

const Properties = rec => {
  return `${Band(rec)} | ${Type(rec)} | ${BW(rec)} | ${FQ(rec)}`;
};

describe('<SpectralResolution />', () => {
  it(`Band.. | Type. | BW | Frequency => Results`, () => {
    mountDefault();
  });
  for (const rec of DATA) {
    it(`${Properties(rec)} => ${rec.spectralResolution}`, () => {
      mount(
        rec.observingBand,
        rec.observationType,
        rec.bandWidth,
        rec.bandWidthUnits,
        rec.frequency,
        rec.frequencyUnits
      );
      cy.get('#spectralResolution').should('have.value', rec.spectralResolution);
    });
  }
});
