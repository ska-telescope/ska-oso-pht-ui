/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import AlertDialog from './AlertDialog';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mountingDefault(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Router location="/" navigator={undefined}>
        <AlertDialog
          open
          onClose={cy.stub().as('onClose')}
          onDialogResponse={cy.stub().as('onDialogResponse')}
        />
      </Router>
    </ThemeProvider>
  );
}

function cancelButtonClick() {
  cy.get('[data-testid="cancelButtonTestId"]').click();
}

function confirmButtonClick() {
  cy.get('[data-testid="confirmButtonTestId"]').click();
}

describe('<AlertDialog />', () => {
  for (const theTheme of THEME) {
    it(`Theme: ${theTheme}`, () => {
      mountingDefault(theTheme);
    });
    it(`-- Clicked Confirm`, () => {
      mountingDefault(theTheme);
      confirmButtonClick();
    });
    it(`-- Clicked Cancel`, () => {
      mountingDefault(theTheme);
      cancelButtonClick();
    });
  }
});
