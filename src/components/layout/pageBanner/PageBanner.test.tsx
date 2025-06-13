import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PageBanner from './PageBanner';

describe('<PageBanner />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <Router location="/" navigator={undefined}>
              <PageBanner pageNo={PAGE_NO} />
            </Router>
          </ThemeProvider>
        </StoreProvider>
      );
      verifyHeader(PAGE_NO);
    });
  }
});
// TODO: move POST proposal/ bad request test where create button is -> title page
describe('POST proposal/ bad request', () => {
  beforeEach(() => {
    // cy.intercept('POST', `${SKA_OSO_SERVICES_URL}`, { statusCode: 500 }).as('postProposalFail');
    viewPort();
    cy.mount(
      <StoreProvider>
        <PageBanner pageNo={1} />
      </StoreProvider>
    );
  });
});
