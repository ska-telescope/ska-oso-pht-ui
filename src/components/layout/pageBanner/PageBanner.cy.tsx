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
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <Router location="/" navigator={undefined}>
              <PageBanner pageNo={0} />
            </Router>
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});
// TODO: move POST proposal/ bad request test where create button is -> title page
describe('POST proposal/ bad request', () => {
  beforeEach(() => {
    // cy.intercept('POST', `{$SKA_PHT_API_URL}`, { statusCode: 500 }).as('postProposalFail');
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <PageBanner pageNo={0} />
        </Router>
      </StoreProvider>
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
  it('displays request message in Alert component on save request, Request Failed', () => {
    cy.intercept('PUT', `/__cypress/iframes/undefined/proposals/undefined`, {
      statusCode: 500,
      body: 'Internal Server Error'
    }).as('apiCallSave500');
    cy.get('[data-testid="saveButtonTestId"]').click();
    cy.wait('@apiCallSave500');
    // TODO: Add verification of popup which lasts a few seconds with user journey
  });
  it('displays request message in Alert component on save request, Request OK', () => {
    cy.intercept('PUT', `/__cypress/iframes/undefined/proposals/undefined`, {
      statusCode: 200,
      body: 'OK'
    }).as('apiCallSaveOK');
    cy.get('[data-testid="saveButtonTestId"]').click();
    cy.wait('@apiCallSaveOK');
    // TODO: Add verification of popup which lasts a few seconds with user journey
  });
});

describe('POST proposal (VALIDATE)', () => {
  beforeEach(() => {
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <PageBanner pageNo={0} />
        </Router>
      </StoreProvider>
    );
  });
  it('displays validate error message in Alert component on validate request, Request Failed', () => {
    cy.intercept('POST', `/__cypress/iframes/undefined/proposals/validate`, {
      statusCode: 500,
      body: 'Internal Server Error'
    }).as('apiCallValidate500');
    cy.get('[data-testid="validationBtn.labelButton"]').click();
    cy.wait('@apiCallValidate500');
    // TODO: Add verification of popup which lasts a few seconds with user journey
  });
  it('displays validate confirmation message in Alert component on validate request, Request Success', () => {
    cy.intercept('POST', '/__cypress/iframes/undefined/proposals/validate', {
      statusCode: 200,
      body: 'OK'
    }).as('apiCallValidateOK');
    cy.get('[data-testid="validationBtn.labelButton"]').click();
    cy.wait('@apiCallValidateOK');
    // TODO: Add verification of popup which lasts a few seconds with user journey
  });
});
