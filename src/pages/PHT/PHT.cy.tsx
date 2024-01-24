/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router';
import MockProposals from '../../services/axios/getProposals/mockProposals';
import theme from '../../services/theme/theme';
import PHT from './PHT';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../utils/constants';

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
    cy.intercept('GET', `${SKA_PHT_API_URL}/list`, { fixture: 'proposalsOldFormat.json' }).as(
      'getProposals'
    );
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
    cy.intercept('GET', `${SKA_PHT_API_URL}/list`, { fixture: 'proposalsOldFormat.json' }).as(
      'getProposals'
    );
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

if (!USE_LOCAL_DATA) {
  describe('Get proposal/list good request', () => {
    beforeEach(() => {
      cy.intercept('GET', `${SKA_PHT_API_URL}/list`, { fixture: 'proposals.json' }).as(
        'getProposals'
      );
      cy.mount(
        <Router location="/" navigator={undefined}>
          <PHT />
        </Router>
      );
    });
    it('displays "Unexpected data format returned from API" on successful getProposals', () => {
      cy.wait('@getProposals');
      // cy.get('[data-testid="dataGridId"]').should('be.visible');
      // temp test that things work as expected before we update the MockProposal format to match API response in the application
      cy.get('[data-testid="alertErrorId"]')
        .should('be.visible')
        .should('have.text', 'Unexpected data format returned from API');
    });
  });
}

if (!USE_LOCAL_DATA) {
  describe('Get proposal/list bad request', () => {
    beforeEach(() => {
      cy.intercept('GET', `${SKA_PHT_API_URL}/list`, { statusCode: 500 }).as('getProposalsFail');
      cy.mount(
        <Router location="/" navigator={undefined}>
          <PHT />
        </Router>
      );
    });
    it('displays error message in Alert component on failed getProposals', () => {
      cy.wait('@getProposalsFail');
      cy.get('[data-testid="alertErrorId"]')
        .should('be.visible')
        .should('have.text', 'Request failed with status code 500');
    });
  });
}
describe('Get proposal good request', () => {
  beforeEach(() => {
    cy.mount(
      <Router location="/" navigator={undefined}>
        <PHT />
      </Router>
    );
  });
  // TODO: issue with targeting the view button in cypress
  /*
    it('displays proposal title in Alert component on success getProposal', () => {
      cy.intercept('GET', `${SKA_PHT_API_URL}`, { fixture: 'proposal.json' }).as('getProposal');
      cy.get('.MuiIconButton-root [data-testid="VisibilityRoundedIcon"]').click();
      cy.wait('@getProposal');
      cy.get('[data-testid="alertViewErrorId"]').should('be.visible');
      // cy.get('[data-testid="alertViewErrorId"]').should('be.visible').should('have.text', 'The Milky Way View');
    });
    */
});
