/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../services/theme/theme';
import App from './App';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../utils/testing/cypress';

describe('<PHT />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});
