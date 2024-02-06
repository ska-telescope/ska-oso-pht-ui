/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import PageBanner from './PageBanner';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<AddProposal />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <PageBanner pageNo={0} />
        </ThemeProvider>
      );
    });
  }
});

describe('POST proposal/ bad request', () => {
  beforeEach(() => {
    // cy.intercept('POST', `${SKA_PHT_API_URL}`, { statusCode: 500 }).as('postProposalFail');
    cy.mount(
      <Router location="/" navigator={undefined}>
        <PageBanner pageNo={0} />
      </Router>
    );
  });
});

describe('PUT proposal (SAVE)', () => {
  beforeEach(() => {
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <PageBanner pageNo={0} />
        </Router>
      </StoreProvider>
    );
  });
  it('displays request message in Alert component on request', () => {
    cy.get('[data-testid="button.saveButton"]').click();
    cy.get('[data-testid="alertSaveErrorId"]')
      .should('be.visible')
      .should('contain', 'Success');
  });
});
// TODO: create unit tests for VALIDATE
