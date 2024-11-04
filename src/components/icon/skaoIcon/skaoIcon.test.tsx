import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import { THEME, viewPort } from '../../../utils/testing/cypress';
import SKAOIcon from './skaoIcon';

const USE_SYMBOL = [false, true];

function mountingDefault(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <SKAOIcon />
    </ThemeProvider>
  );
}

function mounting(theTheme: any, useSymbol: boolean) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <SKAOIcon useSymbol={useSymbol} />
    </ThemeProvider>
  );
}

describe('<StarIcon />', () => {
  for (const theTheme of THEME) {
    for (const useSymbol of USE_SYMBOL) {
      it(`Theme ${theTheme} DEFAULT`, () => {
        mountingDefault(theTheme);
      });
      it(`Theme ${theTheme}, Use Symbol ${useSymbol}`, () => {
        mounting(theTheme, useSymbol);
      });
    }
  }
});
