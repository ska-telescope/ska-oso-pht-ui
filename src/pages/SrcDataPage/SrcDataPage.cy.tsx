/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import SrcDataPage from './SrcDataPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<DataPage />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <Router location="/" navigator={undefined}>
          <SrcDataPage />
            </Router>
        </ThemeProvider>
          </StoreProvider>
          );
    });
  }
});
