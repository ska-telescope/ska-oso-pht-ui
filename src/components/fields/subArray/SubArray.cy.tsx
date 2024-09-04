import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import SubArray from './SubArray';
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
        <SubArray
          setValue={cy.stub().as('setValue')}
          value={value}
          observingBand={band.value}
          telescope={band.telescope}
        />
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
        <SubArray
          setValue={cy.stub().as('setValue')}
          value={value}
          observingBand={band.value}
          telescope={band.telescope}
          suffix="SUFFIX"
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifySubArrayConfiguration(inValue: number) {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="' + inValue + '"]').click();
  // cy.get('[data-testid="subArrayConfiguration"]').contains('subArrayConfiguration.' + inValue);
}

describe('<SubArray />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      for (const band of BANDWIDTH_TELESCOPE) {
        it(`Theme ${theTheme}, Band ${band.value}`, () => {
          mountBasic(theTheme, band);
        });
        it(`Theme ${theTheme}, Band ${band.value}, suffix`, () => {
          mountSized(theTheme, band);
          verifySubArrayConfiguration(1);
        });
      }
    }
  });
});
