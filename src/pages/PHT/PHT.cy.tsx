/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router';
import MockProposals from '../../services/axios/getProposals/mockProposals';
import theme from '../../services/theme/theme';
import PHT from './PHT';

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
      <Router location="/" navigator={undefined}>
        <PHT />
      </Router>
    );
  });
  it('returns 2 results when searching for "Milky Way"', () => {
    cy.get('[data-testid="searchId"]').type('Milky Way');
    cy.get('[data-testid="SearchIcon"]').click();
    cy.get(
      '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    )
      .children('div[role="row"]')
      .should('contain', 'Milky Way')
      .should('have.length', 2);
  });
  it('clearing search input should display all proposals"', () => {
    cy.get('[data-testid="searchId"] input').clear();
    cy.get('[data-testid="SearchIcon"]').click();
    cy.get(
      '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    )
      .children('div[role="row"]')
      .should('have.length', MockProposals.length);
  });
  it('returns 0 results when searching for "xxx"', () => {
    cy.get('[data-testid="searchId"]').type('xxx');
    cy.get('[data-testid="SearchIcon"]').click();
    cy.get(
      '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    )
      .children('div[role="row"]')
      .should('have.length', 0);
  });
});

describe('filtering by proposal type', () => {
  beforeEach(() => {
    cy.mount(
      <Router location="/" navigator={undefined}>
        <PHT />
      </Router>
    );
  });
  it('filters by proposal type "Draft"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="draft"]').click();
    cy.get(
      '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    )
      .children('div[role="row"]')
      .should('have.length', 1)
      .should('contain', 'Draft');
  });
  it('filters by proposal type "Submitted"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="submitted"]').click();
    cy.get(
      '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    )
      .children('div[role="row"]')
      .should('have.length', 2)
      .should('contain', 'Submitted');
  });
  it('filters by proposal type "Accepted"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="accepted"]').click();
    cy.get(
      '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    )
      .children('div[role="row"]')
      .should('have.length', 1)
      .should('contain', 'Accepted');
  });
  it('filters by proposal type "Withdrawn"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="withdrawn"]').click();
    cy.get(
      '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    )
      .children('div[role="row"]')
      .should('have.length', 1)
      .should('contain', 'Withdrawn');
  });
  it('filters by proposal type "Rejected"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="rejected"]').click();
    cy.get(
      '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    )
      .children('div[role="row"]')
      .should('have.length', 0);
  });
  it('shows all proposals when "All Status Types"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value=""]').click();
    cy.get(
      '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    )
      .children('div[role="row"]')
      .should('have.length', MockProposals.length);
  });
});
