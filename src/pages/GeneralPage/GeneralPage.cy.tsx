/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';
import theme from '../../services/theme/theme';
import GeneralPage from './GeneralPage';

const THEME = [THEME_DARK, THEME_LIGHT];

function mountingBasic(theTheme: any) {
  cy.viewport(1500, 1500);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <GeneralPage />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<GeneralPage />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
        mountingBasic(theTheme);
      });
    }
  });

  describe('Content', () => {
    beforeEach(() => {
      mountingBasic(THEME_LIGHT);
    });
    //
    describe('abstract TextEntry', () => {
      it('latex preview button', () => {
        // TODO: Investigate why .type isn't working
        cy.get('[id="abstractId"]').type('hello');
        cy.get('[data-testid="viewIcon"]').click();
        cy.get('[id="modal-modal-title"]').contains('abstract.latexPreviewTitle');
      });
      //     it('abstract updated with user input', () => {
      //       const text = 'This is an abstract';
      //       // Select the textarea and type the text
      //       cy.get('[data-testid="abstractId"]')
      //         .find('textarea')
      //         .first()
      //         .focus();
      //
      //       cy.get('[data-testid="abstractId"]')
      //         .find('textarea')
      //         .first()
      //         .clear();
      //
      //       cy.get('[data-testid="abstractId"]')
      //         .find('textarea')
      //         .first()
      //         .type(text);
      //
      //       // Get the updated abstract value from the input
      //       cy.get('[data-testid="abstractId"]')
      //         .find('textarea')
      //         .first()
      //         .then(abstractInput => {
      //           const updatedAbstract = abstractInput.val();
      //           // Check that the updated abstract matches the typed text
      //           expect(updatedAbstract).to.equal(text);
      //         });
      //     });
      //
      //     it('category updated with user input', () => {
      //       cy.get('[data-testid="ArrowDropDownIcon"]').click();
      //       cy.get('[data-value="2"]').click({force: true});
      //       cy.get('[data-testid="categoryId"]').should('contain', 'Cradle of Life');
      //     });
      //
      //     it('subcategory updated with user input', () => {
      //       cy.get('[data-testid="subCategoryId"]').click();
      //       cy.get('[data-value="1"]').click();
      //       cy.get('[data-testid="subCategoryId"]').should('contain', 'Not specified');
      //     });
    });
  });
});
