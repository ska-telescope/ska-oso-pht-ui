import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import NumStations from './NumStations';
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
        <NumStations setValue={cy.stub().as('setValue')} value={value} />
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
        <NumStations setValue={cy.stub().as('setValue')} value={value} suffix="SUFFIX" />
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyField(inValue: number) {
  cy.get('[data-testid="numStations"]').click();
  // TODO : Extend to cover remaining test variations
}

describe('<NumStations />', () => {
  for (const theTheme of THEME) {
    for (const band of BANDWIDTH_TELESCOPE) {
      it(`Theme ${theTheme}, Band ${band.value}`, () => {
        mountBasic(theTheme, band);
      });
      it(`Theme ${theTheme}, Band ${band.value}, suffix`, () => {
        mountSized(theTheme, band);
        verifyField(1);
      });
    }
  }
});
