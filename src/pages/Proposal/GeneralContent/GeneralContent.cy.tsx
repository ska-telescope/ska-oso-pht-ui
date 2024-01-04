/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router';
import theme from '../../../services/theme/theme';
import GeneralContent from './GeneralContent';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<GeneralContent />', () => {
  const [, setTheProposalState] = React.useState(false);

  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <GeneralContent page={2} setStatus={setTheProposalState} />
        </ThemeProvider>
      );
    });
  }
});

describe('abstract TextEntry', () => {
  const [, setTheProposalState] = React.useState(false);

  beforeEach(() => {
    cy.mount(
      <Router location="/" navigator={undefined}>
        <GeneralContent page={2} setStatus={setTheProposalState} />
      </Router>
    );
  });
  it('abstract updated with user input', () => {
    const text = 'This is an abstract';
    // Select the textarea and type the text
    cy.get('[data-testid="abstractId"]')
      .find('textarea')
      .first()
      .focus();

    cy.get('[data-testid="abstractId"]')
      .find('textarea')
      .first()
      .clear();

    cy.get('[data-testid="abstractId"]')
      .find('textarea')
      .first()
      .type(text);

    // Get the updated abstract value from the input
    cy.get('[data-testid="abstractId"]')
      .find('textarea')
      .first()
      .then(abstractInput => {
        const updatedAbstract = abstractInput.val();
        // Check that the updated abstract matches the typed text
        expect(updatedAbstract).to.equal(text);
      });
  });

  it('category updated with user input', () => {
    cy.get('[data-testid="categoryId"]').click();
    cy.get('[data-value="2"]').click();
    cy.get('[data-testid="categoryId"]').should('contain', 'Cradle of Life');
  });

  it('subcategory updated with user input', () => {
    cy.get('[data-testid="subCategoryId"]').click();
    cy.get('[data-value="1"]').click();
    cy.get('[data-testid="subCategoryId"]').should('contain', 'Not specified');
  });
});
