/*
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../services/theme/theme';
import SciencePage from './SciencePage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';
import { THEME, viewPort } from '../../../utils/testing/cypress';
*/

/*

function mounting(theTheme: any) {
  viewPort();
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
*/

//TODO: enable test after fixing science page pdf delete issue
// describe('<SciencePage />', () => {
//   for (const theTheme of THEME) {
//     it(`Theme ${theTheme}: Renders & has choose button`, () => {
//       mounting(theTheme);
//       cy.get('[data-testid="SearchIcon"]').click();
//       cy.get('[data-testid="fileUploadChooseButton"]').contains('Choose file');
//     });
//   }
// });
