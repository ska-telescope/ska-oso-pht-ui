/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import GeneralPage from './GeneralPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<GeneralPage />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
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
      });
    }
  });

  describe('Content', () => {
    beforeEach(() => {
      cy.mount(
        <StoreProvider>
          <Router location="/" navigator={undefined}>
            s
            <GeneralPage />
          </Router>
        </StoreProvider>
      );
    });
    //
    //   describe('abstract TextEntry', () => {
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
    //   });
  });
});
