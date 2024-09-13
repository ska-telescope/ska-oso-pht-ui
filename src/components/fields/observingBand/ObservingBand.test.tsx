import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import ObservingBand from './ObservingBand';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { BANDWIDTH_TELESCOPE } from '../../../utils/constants';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const value = 0;

function mountBasic(theTheme: any, band: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <ObservingBand setValue={cy.stub().as('setValue')} value={value} />
      </ThemeProvider>
    </StoreProvider>
  );
}

function mountSized(theTheme: any, band: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <ObservingBand setValue={cy.stub().as('setValue')} value={value} suffix="SUFFIX" />
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyObservingBandConfiguration(inValue: number) {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="' + inValue + '"]').click();
}

describe('<ObservingBand />', () => {
  for (const theTheme of THEME) {
    for (const band of BANDWIDTH_TELESCOPE) {
      it(`Theme ${theTheme}, Band ${band.value}`, () => {
        mountBasic(theTheme, band);
      });
      it(`Theme ${theTheme}, Band ${band.value}, suffix`, () => {
        mountSized(theTheme, band);
        verifyObservingBandConfiguration(1);
      });
    }
  }
});
