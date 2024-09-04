import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import NumStations from './NumStations';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { BANDWIDTH_TELESCOPE } from '../../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];
const value = 0;

function viewport() {
  cy.viewport(2000, 1000);
}

function mountBasic(theTheme: any, band: any) {
  viewport();
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
  viewport();
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
  describe('Theme', () => {
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
});
