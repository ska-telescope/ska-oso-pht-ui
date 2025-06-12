/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Router } from 'react-router-dom';
import theme from '../../../services/theme/theme';
import AddProposal from './AddProposal';
import { SKA_OSO_SERVICES_URL } from '../../../utils/constants';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../utils/testing/cypress';

describe('<AddProposal />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <BrowserRouter>
              <AddProposal />
            </BrowserRouter>
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});

describe('POST proposal/ bad request', () => {
  beforeEach(() => {
    cy.intercept('POST', `${SKA_OSO_SERVICES_URL}`, { statusCode: 500 }).as('postProposalFail');
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <AddProposal />
        </Router>
      </StoreProvider>
    );
  });
  // it('displays error message in Alert component on failed request', () => {
  //   const text = 'Milky Way';
  //   cy.get('[data-testid="titleId"] input').type(text);
  //   cy.get('#ProposalType-1').click();
  //   cy.get('#proposalAttribute-1').click();
  //   cy.get('[data-testid="CreateButton"]').click();
  //   cy.wait('@postProposalFail');
  //   cy.get('[data-testid="alertCreateErrorId"]')
  //     .should('be.visible')
  //     .should('have.text', 'Request failed with status code 500');
  // });
});

describe('POST proposal', () => {
  beforeEach(() => {
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <AddProposal />
        </Router>
      </StoreProvider>
    );
  });
  // it('displays request message in Alert component on request', () => {
  //   const text = 'The Milky Way View';
  //   cy.get('[data-testid="titleId"] input').type(text);
  //   cy.get('#ProposalType-1').click();
  //   cy.get('#proposalAttribute-1').click();
  //   cy.get('[data-testid="CreateButton"]').click();
  //   cy.get('[data-testid="alertCreateErrorId"]')
  //     .should('be.visible')
  //     .should('contain', 'Success')
  //     .should('have.text', 'Success: post /proposal');
  // });
});
