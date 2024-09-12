import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../services/theme/theme';
import StatusArray from './StatusArray';
import { THEME, viewPort } from '../../utils/testing/cypress';

function mountingBasic(theTheme: any) {
  viewPort();
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
