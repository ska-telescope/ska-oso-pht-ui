/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import TeamFileImport from './TeamFileImport';
import { THEME, viewPort } from '../../../utils/testing/cypress';

describe('<TeamFileImport />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <TeamFileImport />
        </ThemeProvider>
      );
    });
  }
});
