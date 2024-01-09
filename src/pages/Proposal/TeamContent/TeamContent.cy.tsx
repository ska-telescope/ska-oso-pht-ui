/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import TeamContent from './TeamContent';
import { TEAM, TEAM_STATUS_TYPE_OPTIONS } from '../../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<TeamContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <TeamContent page={0} setStatus={cy.stub().as('setTheProposalState')} />
        </ThemeProvider>
      );
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    cy.mount(
      <ThemeProvider theme={theme(THEME_LIGHT)}>
        <CssBaseline />
        <TeamContent page={0} setStatus={cy.stub().as('setTheProposalState')} />
      </ThemeProvider>
    );
  });

  describe('Stars', () => {
    it('Displays filled star for PI', () => {
      const index = TEAM.findIndex(teamMember => teamMember.PI);
      if (index !== -1) {
        cy.get(
          `[data-testid="teamTableId"] div[data-rowindex="${index}"] div[data-field="PI"] [data-testid="StarRateRoundedIcon"]`
        ).should('exist');
      }
    });
    it('Displays border star for non PI accepted invitation', () => {
      const index = TEAM.findIndex(
        teamMember => !teamMember.PI && teamMember.Status === TEAM_STATUS_TYPE_OPTIONS.accepted
      );
      if (index !== -1) {
        cy.get(
          `[data-testid="teamTableId"] div[data-rowindex="${index}"] div[data-field="PI"] [data-testid="StarBorderRoundedIcon"]`
        ).should('exist');
      }
    });
    it('Displays no star for pending invitation', () => {
      const index = TEAM.findIndex(
        teamMember => teamMember.Status === TEAM_STATUS_TYPE_OPTIONS.pending
      );
      if (index !== -1) {
        cy.get(
          `[data-testid="teamTableId"] div[data-rowindex="${index}"] div[data-field="PI"]`
        ).should('be.empty');
      }
    });
  });
});

describe('First Name', () => {
  it('first name updated with user input', () => {
    // const text = 'John Smith';
    // Select the input field and type the text
    cy.get('[data-testid="firstNameId"]');
    // Get the updated first name value from the input
    /* cy.get('[data-testid="firstNameId"] input').then(firstNameInput => {
      // const updatedTitle = firstNameInput.val();
      // Check that the updated first name matches the typed text
      expect(firstNameInput.val()).to.equal(text);
    }); */
  });
  /*
  it('title field displays error when incorrect input entered', () => {
    const incorrectText = 'XXX*%$';
    // Select the input field and type the text
    cy.get('[data-testid="titleId"] input').type(incorrectText);
    // Get the text displayed in the helper text section
    cy.get('[data-testid="titleId"] > p.Mui-error')
      .invoke('text')
      .then(helperText => {
        // Check that helper text matches what's expected
        expect(helperText).to.equal(TEXT_ENTRY_PARAMS.TITLE.ERROR_TEXT);
      });
  });
  it('should clear the title helper text when text is cleared', () => {
    const incorrectText = 'XXX*%$';
    // Type incorrect text into the input field
    cy.get('[data-testid="titleId"] input').type(incorrectText);
    // Check that the helper text element exists
    cy.get('[data-testid="titleId"] > p.Mui-error').should('exist');
    // Clear the input field
    cy.get('[data-testid="titleId"] input').clear();
    // Check that the helper text element doesn't exist
    cy.get('[data-testid="titleId"] > p.Mui-error').should('not.exist');
  });
  it('should set the title field to incorrect status when incorrect text is entered', () => {
    const incorrectText = 'XXX*%$';
    // Type incorrect text into the input field
    cy.get('[data-testid="titleId"] input').type(incorrectText);
    // Check that the input field has an "incorrect" status
    cy.get('[data-testid="titleId"] input').should('have.attr', 'aria-invalid', 'true');
  });
  */
});
