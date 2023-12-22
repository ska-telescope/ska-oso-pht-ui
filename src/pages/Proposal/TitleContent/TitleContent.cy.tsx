/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router';
import { TITLE_HELPER_TEXT } from '../../../utils/constants';
import theme from '../../../services/theme/theme';
import TitleContent from './TitleContent';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<TitleContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <TitleContent />
        </ThemeProvider>
      );
    });
  }
});

describe('title TextField', () => {
  beforeEach(() => {
    cy.mount(
      <Router location='/' navigator={undefined}>
        <TitleContent />
      </Router>
    );
  });
  it('title updated with user input', () => {
    const text = "Milky Way";
    // Select the input field and type the text
    cy.get('#titleId').type(text);
    // Get the updated title value from the input
    cy.get('#titleId').then((titleInput) => {
      const updatedTitle = titleInput.val();
      // Check that the updated title matches the typed text
      expect(updatedTitle).to.equal(text);
    });
  });
  it('title field displays error when incorrect input entered', () => {
    const incorrectText = "XXX*%$";
    // Select the input field and type the text
    cy.get('#titleId').type(incorrectText);
    // Get the text displayed in the helper text section
    cy.get('#titleId-helper-text').invoke('text').then((helperText) => {
      // Check that helper text matches what's expected
      expect(helperText).to.equal(TITLE_HELPER_TEXT);
    });
  });
  it('should clear the title helper text when text is cleared', () => {
    const incorrectText = "XXX*%$";
    // Type incorrect text into the input field
    cy.get('#titleId').type(incorrectText);
    // Check that the helper text element exists
    cy.get('#titleId-helper-text').should('exist');
    // Clear the input field
    cy.get('#titleId').clear();
    // Check that the helper text element doesn't exist
    cy.get('#titleId-helper-text').should('not.exist');
  });
  it('should set the title field to incorrect status when incorrect text is entered', () => {
    const incorrectText = "XXX*%$";
    // Type incorrect text into the input field
    cy.get('#titleId').type(incorrectText);
    // Check that the input field has an "incorrect" status
    cy.get('#titleId').should('have.attr', 'aria-invalid', 'true');
  });
 })
