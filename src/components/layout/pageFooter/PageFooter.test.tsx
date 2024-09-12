/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import PageFooter from './PageFooter';
import { LAST_PAGE } from '../../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];
const PAGES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function viewport() {
  cy.viewport(2000, 1000);
}

function mount(theTheme: any, pageNo: number) {
  viewport();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <PageFooter pageNo={pageNo} />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

export function verifyFooter(pageNo: number) {
  if (true && pageNo > 0) {
    cy.get('[data-testId="prevButtonTestId"]').contains('page.' + (pageNo - 1) + '.title');
  }
  if (pageNo < LAST_PAGE - 1) {
    cy.get('[data-testId="nextButtonTestId"]').contains('page.' + (pageNo + 1) + '.title');
  }
}

export function verifyFooterNegative(pageNo: number) {
  if (pageNo === -1) {
    cy.get('[data-testId="nextButtonTestId"]').contains('button.create');
  }
  if (pageNo === -2) {
    cy.get('[data-testId="nextButtonTestId"]').contains('button.add');
  }
}

describe('<PageFooter />', () => {
  for (const theTheme of THEME) {
    for (const page of PAGES) {
      it(`Theme ${theTheme}, Page ${page}`, () => {
        mount(theTheme, page);
        verifyFooter(page);
      });
    }
    it(`Theme ${theTheme}, Page ${-1}`, () => {
      mount(theTheme, -1);
      verifyFooterNegative(-1);
    });
    it(`Theme ${theTheme}, Page ${-2}`, () => {
      mount(theTheme, -2);
      verifyFooterNegative(-2);
    });
  }
});

/*
// TODO: move POST proposal/ bad request test where create button is -> title page
describe('POST proposal/ bad request', () => {
  beforeEach(() => {
    // cy.intercept('POST', `${SKA_PHT_API_URL}`, { statusCode: 500 }).as('postProposalFail');
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <PageFooter pageNo={0} />
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
          <PageFooter pageNo={0} />
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
          <PageFooter pageNo={0} />
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
*/
