/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import TargetPage from './TargetPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<TargetPage />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <Router location="/" navigator={undefined}>
              <TargetPage />
            </Router>
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
  it(`Verify target elements`, () => {
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <TargetPage />
        </Router>
      </StoreProvider>
    );
    cy.get('[data-testid="noSpecificTarget"]').contains('noSpecificTarget');
    cy.get('[data-testid="listOfTargets"]').contains('listOfTargets');
    cy.get('[data-testid="targetMosaic"]').contains('targetMosaic');
  });
});
