import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import Shell from './Shell';
import { Router } from 'react-router-dom';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mounting(theTheme) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <Shell page={1} />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<Shell />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    mounting(THEME[1]);
  });
});
