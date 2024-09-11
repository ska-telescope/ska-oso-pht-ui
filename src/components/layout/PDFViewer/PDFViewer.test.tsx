/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import PDFViewer from './PDFViewer';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

function mounting(theTheme) {
  cy.viewport(2000, 1000);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <PDFViewer open={false} onClose={null} url="" />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<PDFViewer />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    mounting(THEME_LIGHT);
  });
});
