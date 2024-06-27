/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TargetListSection from './targetListSection';
import theme from '../../../services/theme/theme';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<TargetListSection />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <Router location="/" navigator={undefined}>
              <TargetListSection />
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
          <TargetListSection />
        </Router>
      </StoreProvider>
    );
  });
});
