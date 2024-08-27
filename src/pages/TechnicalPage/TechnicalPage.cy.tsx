/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import TechnicalPage from './TechnicalPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

function mounting(theTheme: any) {
  cy.viewport(2000, 1000);
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
}

//TODO: enable test after fixing technical page pdf delete issue
// describe('<TechnicalPage />', () => {
//   for (const theTheme of THEME) {
//     it(`Theme ${theTheme}: Renders & has choose button`, () => {
//       mounting(theTheme);
//       cy.get('[data-testid="SearchIcon"]').click();
//       cy.get('[data-testid="fileUploadChooseButton"]').contains('Choose file');
//     });
//   }
// });
