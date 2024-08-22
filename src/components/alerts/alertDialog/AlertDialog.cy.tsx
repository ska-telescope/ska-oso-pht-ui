/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import AlertDialog from './AlertDialog';

const THEME = [THEME_DARK, THEME_LIGHT];

function mounting(theTheme) {
  cy.viewport(2000, 1000);
  cy.mount(
    <StoreProvider>
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
    </StoreProvider>
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
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});

describe('Open and confirm', () => {
  beforeEach(() => {
    mounting(THEME_LIGHT);
    confirmButtonClick();
  });
});

describe('Open and cancel', () => {
  beforeEach(() => {
    mounting(THEME_LIGHT);
    cancelButtonClick();
  });
});
