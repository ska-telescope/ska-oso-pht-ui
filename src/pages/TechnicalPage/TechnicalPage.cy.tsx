/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';
import theme from '../../services/theme/theme';
import TechnicalPage from './TechnicalPage';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<TechnicalPage />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <Router location="/" navigator={undefined}>
              <TechnicalPage />
            </Router>
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
  it(`Verify upload file elements`, () => {
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <TechnicalPage />
        </Router>
      </StoreProvider>
    );
    cy.get('[data-testid="SearchIcon"]').click();
  });

  it(`Verify pdf preview elements`, () => {
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <TechnicalPage />
        </Router>
      </StoreProvider>
    );
    // cy.get('[data-testid="pdfPreviewLabel"]').contains('PDF Preview');
  });
});
