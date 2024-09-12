import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import HelpPanel from './helpPanel';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mountingBasic(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <HelpPanel />
    </ThemeProvider>
  );
}

describe('<HelpPanel />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (basic)`, () => {
      mountingBasic(theTheme);
    });
  }
});
