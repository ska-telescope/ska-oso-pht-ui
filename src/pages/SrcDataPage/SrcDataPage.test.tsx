/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../services/theme/theme';
import SrcDataPage from './SrcDataPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';
import { THEME, viewPort } from '../../utils/testing/cypress';

describe('<SrcDataPage />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.stub()
        .as('getProposalState')
        .returns([9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
      cy.stub().as('updateAppContent1');
      viewPort();
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
