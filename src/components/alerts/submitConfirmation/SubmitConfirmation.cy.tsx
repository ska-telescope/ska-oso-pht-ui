/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import SubmitConfirmation from './SubmitConfirmation';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<SubmitConfirmation />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <SubmitConfirmation
              pageNo={0}
              onClose={cy.stub().as('handleCancel')}
              onConfirm={cy.stub().as('handleConfirm')}
              open
            />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});

describe('PUT proposal (SUBMIT)', () => {
  beforeEach(() => {
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <SubmitConfirmation
            pageNo={0}
            onClose={cy.stub().as('handleCancel')}
            onConfirm={cy.stub().as('handleConfirm')}
            open
          />
        </Router>
      </StoreProvider>
    );
  });
  it('displays request message in Alert component on request, Request Successful', () => {
    cy.get('[data-testid="ConfirmButton"]').click();
    cy.get('[data-testid="alertSaveErrorId"]')
      .should('be.visible')
      .should('contain', 'Success');
  });
});
