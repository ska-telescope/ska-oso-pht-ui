/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../services/theme/theme';
import LandingPage from './LandingPage';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<PHT />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <LandingPage />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});

describe('search functionality', () => {
  beforeEach(() => {
    cy.intercept('GET', `${SKA_PHT_API_URL}/list`, { fixture: 'proposalsOldFormat.json' }).as(
      'getProposalList'
    );
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <LandingPage />
        </Router>
      </StoreProvider>
    );
  });
  it('returns 2 results when searching for "Milky Way"', () => {
    cy.get('[data-testid="searchId"]').type('Milky Way');
    cy.get('[data-testid="SearchIcon"]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('contain', 'Milky Way')
    //   .should('have.length', 2);
  });
  it('returns 1 result when searching for "SKA_5000_2022"', () => {
    cy.get('[data-testid="searchId"]').type('SKA_5000_2022');
    cy.get('[data-testid="SearchIcon"]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('contain', 'SKA_5000_2022')
    //   .should('have.length', 1);
  });
  it('clearing search input should display all proposals"', () => {
    cy.get('[data-testid="searchId"] input').clear();
    cy.get('[data-testid="SearchIcon"]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('have.length', MockProposals.length);
  });
  it('returns 0 results when searching for "xxx"', () => {
    cy.get('[data-testid="searchId"]').type('xxx');
    cy.get('[data-testid="SearchIcon"]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('have.length', 0);
  });
});

describe('filtering by proposal type', () => {
  beforeEach(() => {
    cy.intercept('GET', `${SKA_PHT_API_URL}/list`, { fixture: 'proposalsOldFormat.json' }).as(
      'getProposalList'
    );
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <LandingPage />
        </Router>
      </StoreProvider>
    );
  });
  it('filters by proposal type "Draft"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="draft"]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('have.length', 1)
    //   .should('contain', 'Draft');
  });
  it('filters by proposal type "Submitted"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="submitted"]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('have.length', 2)
    //   .should('contain', 'Submitted');
  });
  it('filters by proposal type "Accepted"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="accepted"]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('have.length', 1)
    //   .should('contain', 'Accepted');
  });
  it('filters by proposal type "Withdrawn"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="withdrawn"]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('have.length', 1)
    //   .should('contain', 'Withdrawn');
  });
  it('filters by proposal type "Rejected"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value="rejected"]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('have.length', 0);
  });
  it('shows all proposals when "All Status Types"', () => {
    cy.get('[data-testid="proposalType"]').click();
    cy.get('[data-value=""]').click();
    // cy.get(
    //   '[data-testid="dataGridId"] div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
    // )
    //   .children('div[role="row"]')
    //   .should('have.length', MockProposals.length);
  });
});

// we should not need to use if LOCAL_DATA in tests as they should always use the local data
// currently removing this will cause the tests to fail when the data is returned from the API
// TODO: set up Cypress so that it always use some local data for the tests
if (!USE_LOCAL_DATA) {
  describe('Get proposal/list good request', () => {
    beforeEach(() => {
      cy.intercept('GET', `${SKA_PHT_API_URL}/list`, { fixture: 'proposals.json' }).as(
        'getProposalList'
      );
      cy.mount(
        <StoreProvider>
          <Router location="/" navigator={undefined}>
            <LandingPage />
          </Router>
        </StoreProvider>
      );
    });
    it('displays "Unexpected data format returned from API" on successful getProposalList', () => {
      // cy.wait('@getProposalList');
      // // cy.get('[data-testid="dataGridId"]').should('be.visible');
      // // temp test that things work as expected before we update the MockProposal format to match API response in the application
      // cy.get('[data-testid="alertErrorId"]')
      //   .should('be.visible')
      //   .should('have.text', 'Unexpected data format returned from API');
    });
  });
}

// we should not need to use if LOCAL_DATA in tests as they should always use the local data
// currently removing this will cause the tests to fail when the data is returned from the API
// TODO: set up Cypress so that it always use some local data for the tests
if (!USE_LOCAL_DATA) {
  describe('Get proposal/list bad request', () => {
    beforeEach(() => {
      cy.intercept('GET', `${SKA_PHT_API_URL}/list`, { statusCode: 500 }).as('getProposalListFail');
      cy.mount(
        <StoreProvider>
          <Router location="/" navigator={undefined}>
            <LandingPage />
          </Router>
        </StoreProvider>
      );
    });
    // it('displays error message in Alert component on failed getProposalList', () => {
    //   cy.wait('@getProposalListFail');
    //   cy.get('[data-testid="alertErrorId"]')
    //     .should('be.visible')
    //     .should('have.text', 'Request failed with status code 500');
    // });
  });
}
describe('Get proposal good request', () => {
  beforeEach(() => {
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <LandingPage />
        </Router>
      </StoreProvider>
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
