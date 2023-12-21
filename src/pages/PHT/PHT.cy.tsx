/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { mount } from 'cypress/react';
import { Router } from 'react-router';
import { EXISTING_PROPOSALS } from '../../utils/constants';
import theme from '../../services/theme/theme';
import PHT from './PHT'

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<PHT />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <PHT />
        </ThemeProvider>
      );
    });
  }

});

describe('search functionality', () => {
  beforeEach(() => {
    cy.mount(
      <Router location='/' navigator={undefined}>
        <PHT />
      </Router>
    );
  });
  // search input tests
  it('returns 2 results when searching for "Milky Way"', () => {
    cy.get('[data-testid="searchId"]').type('Milky Way{enter}');
    cy.get('[data-testid="dataGridId"] div[role="row"]')
    .should('contain', 'Milky Way')
    .should('have.length', 2)
  })
  it('clearing search input should display all proposals"', () => {
    cy.get('[data-testid="searchId"] input').clear();
    cy.get('[data-testid="searchId"]').type('{enter}');
    cy.get('[data-testid="dataGridId"] div[role="rowgroup"]:not(:first-child) [role="row"]')
    // .children().get('[role="row"]')
    .should('have.length', EXISTING_PROPOSALS.length);
  })
  /*
  it('returns 0 results when searching for "xxx"', () => {
    cy.get('[data-testid="searchId"]').type('xxx Way{enter}');
    cy.get('[data-testid="dataGridId"]')
    .children().should('have.length', 0)
  })
  */
 })