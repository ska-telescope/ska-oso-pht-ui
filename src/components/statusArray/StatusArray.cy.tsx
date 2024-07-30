import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import StatusArray from './StatusArray';

const THEME = [THEME_DARK, THEME_LIGHT];

function mountingBasic(theTheme: any) {
  cy.viewport(2000, 1000);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <StatusArray />
    </ThemeProvider>
  );
}

describe('<StatusArray />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (basic)`, () => {
      mountingBasic(theTheme);
    });
  }
});
