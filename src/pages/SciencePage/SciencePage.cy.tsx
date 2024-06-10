/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import SciencePage from './SciencePage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

function mounting(theTheme: any) {
  cy.viewport(1500, 1000);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <SciencePage />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<SciencePage />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders & has choose button`, () => {
      mounting(theTheme);
      cy.get('[data-testid="SearchIcon"]').click();
      cy.get('[data-testid="fileUploadChooseButton"]').contains('Choose file');
    });
  }
});
