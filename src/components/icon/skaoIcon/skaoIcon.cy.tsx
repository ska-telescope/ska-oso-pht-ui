import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import DownloadIcon from '@mui/icons-material/DownloadRounded';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import skaoIcon from './skaoIcon';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';
const USE_SYMBOL = [true, false];
const LOGO_HEIGHT = 100;

function viewPort() {
  cy.viewport(1500, 1000);
}

function mountingDefault(theTheme: any) {
  viewPort() 
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
        {skaoIcon({})}
    </ThemeProvider>
  );
}

function mounting(theTheme: any, useSymbol: boolean) {
  viewPort() 
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
        {skaoIcon({useSymbol : useSymbol, logoHeight: LOGO_HEIGHT})}
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="iconIcon"]').click();
}

function validateToolTip() {
  cy.get('[data-testid="iconIcon"]').trigger('mouseover');
  cy.contains(TOOLTIP).should('be.visible');
}

describe('<Icon />', () => {
  for (const theTheme of THEME) {
      it(`Theme ${theTheme} | Disabled DEFAULT`, () => {
        mountingDefault(theTheme);
        validateClick();
        validateToolTip();
      });
  }

  for (const theTheme of THEME) {
    for (const useSymbol of USE_SYMBOL) {
      it(`Theme ${theTheme} | useSymbol ${useSymbol}`, () => {
        mounting(theTheme, useSymbol);
        validateClick();
        validateToolTip();
      });
    }
  }
});
