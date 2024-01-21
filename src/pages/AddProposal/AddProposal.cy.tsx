/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router-dom';
import theme from '../../services/theme/theme';
import AddProposal from './AddProposal';
import { SKA_PHT_API_URL } from '../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<AddProposal />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <AddProposal />
        </ThemeProvider>
      );
    });
  }
});

  describe('POST proposal/ bad request', () => {
    beforeEach(() => {
      cy.intercept('POST', `${SKA_PHT_API_URL}`, { statusCode: 500 }).as('postProposalFail');
      cy.mount(
        <Router location="/" navigator={undefined}>
          <AddProposal />
        </Router>
      );
    });
    it('displays error message in Alert component on failed request', () => {
      const text = 'Milky Way';
      cy.get('[data-testid="titleId"] input').type(text);
      cy.get('#ProposalType-1').click();
      cy.get('#SubProposalType-1').click();
      cy.get('[data-testid="CreateButton"]').click();
      cy.wait('@postProposalFail');
      cy.get('[data-testid="alertCreateErrorId"]')
        .should('be.visible')
        .should('have.text', 'Request failed with status code 500');
    });
  });

  describe('POST proposal', () => {
    beforeEach(() => {
      cy.mount(
        <Router location="/" navigator={undefined}>
          <AddProposal />
        </Router>
      );
    });
    it('displays request message in Alert component on request', () => {
      const text = 'The Milky Way View';
      cy.get('[data-testid="titleId"] input').type(text);
      cy.get('#ProposalType-1').click();
      cy.get('#SubProposalType-1').click();
      cy.get('[data-testid="CreateButton"]').click();
      cy.get('[data-testid="alertCreateErrorId"]')
        .should('be.visible')
        .should('contain', 'Success')
        .should('have.text', 'Success: post /proposal');
    });
  });