/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import TargetPage from './TargetPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

function mount(theTheme) {
  cy.viewport(1500, 1500);
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
}

describe('<TargetPage />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mount(theTheme);
    });
  }
  it(`Verify target elements`, () => {
    mount(THEME_LIGHT);
    cy.get('#noSpecificTarget');
    cy.get('#listOfTargets').contains('listOfTargets.label');
    cy.get('#targetMosaic').contains('targetMosaic.label');
  });
});
