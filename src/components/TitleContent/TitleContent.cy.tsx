/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
// import { TEXT_ENTRY_PARAMS } from '../../utils/constants';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../services/theme/theme';
import TitleContent from './TitleContent';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<TitleContent />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
        cy.mount(
          <StoreProvider>
            <ThemeProvider theme={theme(theTheme)}>
              <CssBaseline />
              <TitleContent page={0} />
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
          <ThemeProvider theme={theme(THEME_LIGHT)}>
            <CssBaseline />
            <TitleContent page={0} />
          </ThemeProvider>
        </StoreProvider>
      );
    });

    describe('Title', () => {
      // it('title updated with user input', () => {
      //   const text = 'Milky Way';
      // Select the input field and type the text
      //   cy.get('[data-testid="titleId"] input').type(text);
      // Get the updated title value from the input
      //   cy.get('[data-testid="titleId"] input').then(titleInput => {
      //     const updatedTitle = titleInput.val();
      // Check that the updated title matches the typed text
      //     expect(updatedTitle).to.equal(text);
      //   });
      // });
      // it('title field displays error when incorrect input entered', () => {
      //   const incorrectText = 'XXX*%$';
      // Select the input field and type the text
      //   cy.get('[data-testid="titleId"] input').type(incorrectText);
      // Get the text displayed in the helper text section
      //   cy.get('[data-testid="titleId"] > p.Mui-error')
      //     .invoke('text')
      //     .then(helperText => {
      // Check that helper text matches what's expected
      //       expect(helperText).to.equal(TEXT_ENTRY_PARAMS.DEFAULT.ERROR_TEXT);
      //     });
      //  });
      // it('should clear the title helper text when text is cleared', () => {
      // const incorrectText = 'XXX*%$';
      // Type incorrect text into the input field
      //   cy.get('[data-testid="titleId"] input').type(incorrectText);
      // Check that the helper text element exists
      //   cy.get('[data-testid="titleId"] > p.Mui-error').should('exist');
      // Clear the input field
      //   cy.get('[data-testid="titleId"] input').clear();
      // Check that the helper text element doesn't exist
      // cy.get('[data-testid="titleId"] > p.Mui-error').should('not.exist');
      // });
      // it('should set the title field to incorrect status when incorrect text is entered', () => {
      //   const incorrectText = 'XXX*%$';
      // Type incorrect text into the input field
      //   cy.get('[data-testid="titleId"] input').type(incorrectText);
      // Check that the input field has an "incorrect" status
      //   cy.get('[data-testid="titleId"] input').should('have.attr', 'aria-invalid', 'true');
      // });
    });

    describe('Proposal type selection', () => {
      // it('proposal selected when proposal clicked', () => {
      //   // select 1st Proposal type
      //   cy.get('#ProposalType-1').click();
      //   // check if 1st proposal is selected
      //   cy.get('#ProposalType-1').should('have.class', 'active');
      // });
      // it('proposal NOT selected when proposal NOT clicked', () => {
      // select 1st Proposal type
      //   cy.get('#ProposalType-1').click();
      // check if 3rd proposal is not selected
      // cy.get('#ProposalType-3').should('have.class', 'inactive');
      // });
      // it('should open alert dialog when changing proposal type', () => {
      //   // select 1st Proposal type
      //   cy.get('#ProposalType-1').click();
      //   // select 2nd Proposal type
      //   cy.get('#ProposalType-2').click();
      //   // check if alert dialog open
      //   cy.get('#alert-dialog-proposal-change')
      //     .should('exist')
      //     .should('be.visible');
      // });
      // it('should NOT open alert dialog when selecting same proposal type', () => {
      //   // select 2st Proposal type
      //   cy.get('#ProposalType-2').click();
      //   // select 2nd Proposal type
      //   cy.get('#ProposalType-2').click();
      //   // check if alert dialog not open
      //   cy.get('#alert-dialog-proposal-change').should('not.exist');
      // });
      // it('should NOT open alert dialog on 1st proposal type selection', () => {
      //   // select 2st Proposal type
      //   cy.get('#ProposalType-2').click();
      //   // check if alert dialog not open
      //   cy.get('#alert-dialog-proposal-change').should('not.exist');
      // });
      // it('should change proposal type if clicking "Continue" on alert dialog', () => {
      //   // select 2st Proposal type
      //   cy.get('#ProposalType-2').click();
      //   // select 1st Proposal type
      //   cy.get('#ProposalType-1').click();
      //   // click "continue button" of dialog
      //   cy.get('[data-testid="continueId"]').click();
      //   // check if 1st proposal is selected
      //   cy.get('#ProposalType-1').should('have.class', 'active');
      // });
      // it('should NOT change proposal type if clicking "Cancel" on alert dialog', () => {
      //   // select 2st Proposal type
      //   cy.get('#ProposalType-2').click();
      //   // select 1st Proposal type
      //   cy.get('#ProposalType-1').click();
      //   // click "cancel button" of dialog
      //   cy.get('[data-testid="cancelId"]').click();
      //   // check if 1st proposal is NOT selected
      //   cy.get('#ProposalType-1').should('have.class', 'inactive');
      //   cy.get('#ProposalType-2').should('have.class', 'active');
      // });
    });

    describe('Sub-proposal type selection', () => {
      //   it('sub-proposals should NOT be selected when proposal clicked', () => {
      //     // select 1st Proposal type
      //     cy.get('#ProposalType-1').click();
      //     // check if sub-proposal are NOT selected
      //     cy.get('#SubProposalContainer > div')
      //       .children()
      //       .should('have.class', 'inactive');
      //   });
      //   it('sub-proposal selected when sub-proposal clicked', () => {
      //     // select 1st Proposal type
      //     cy.get('#ProposalType-1').click();
      //     // select 1st SubProposal type
      //     cy.get('#SubProposalType-1').click();
      //     // check if 1st proposal is selected
      //     cy.get('#SubProposalType-1').should('have.class', 'active');
      //   });
      //   it('sub-proposal NOT selected when sub-proposal NOT clicked', () => {
      //     // select 1st Proposal type
      //     cy.get('#ProposalType-1').click();
      //     // select 1st SubProposal type
      //     cy.get('#SubProposalType-1').click();
      //     // check if 3rd proposal is not selected
      //     cy.get('#SubProposalType-3').should('have.class', 'inactive');
      //   });
      //   it('should open alert dialog when changing sub-proposal type', () => {
      //     // select 1st Proposal type
      //     cy.get('#ProposalType-1').click();
      //     // select 1st SubProposal type
      //     cy.get('#SubProposalType-1').click();
      //     // select 2nd SubProposal type
      //     cy.get('#SubProposalType-2').click();
      //     // check if alert dialog open
      //     cy.get('#alert-dialog-proposal-change')
      //       .should('exist')
      //       .should('be.visible');
      //   });
      //   it('should NOT open alert dialog when selecting same sub-proposal type', () => {
      //     // select 2st Proposal type
      //     cy.get('#ProposalType-2').click();
      //     // select 5th SubProposal type
      //     cy.get('#SubProposalType-5').click();
      //     // select 5th SubProposal type
      //     cy.get('#SubProposalType-5').click();
      //     // check if alert dialog not open
      //     cy.get('#alert-dialog-proposal-change').should('not.exist');
      //   });
      //   it('should NOT open alert dialog on 1st sub-proposal type selection', () => {
      //     // select 2st Proposal type
      //     cy.get('#ProposalType-2').click();
      //     // select 5th SubProposal type
      //     cy.get('#SubProposalType-5').click();
      //     // check if alert dialog not open
      //     cy.get('#alert-dialog-proposal-change').should('not.exist');
      //   });
      //   it('should change sub-proposal type if clicking "Continue" on alert dialog', () => {
      //     // select 2st Proposal type
      //     cy.get('#ProposalType-2').click();
      //     // select 5th SubProposal type
      //     cy.get('#SubProposalType-5').click();
      //     // select 6th SubProposal type
      //     cy.get('#SubProposalType-6').click();
      //     // click "continue button" of dialog
      //     cy.get('[data-testid="continueId"]').click();
      //     // check if 6th sub-proposal is selected
      //     cy.get('#SubProposalType-6').should('have.class', 'active');
      //   });
      //   it('should NOT change sub-proposal type if clicking "Cancel" on alert dialog', () => {
      //     // select 2st Proposal type
      //     cy.get('#ProposalType-2').click()s;
      //     // select 5th SubProposal type
      //     cy.get('#SubProposalType-5').click();
      //     // select 6th SubProposal type
      //     cy.get('#SubProposalType-6').click();
      //     // click "continue button" of dialog
      //     cy.get('[data-testid="cancelId"]').click();
      //     // check if 6th sub-proposal is NOT selected
      //     cy.get('#SubProposalType-6').should('have.class', 'inactive');
      //     cy.get('#SubProposalType-5').should('have.class', 'active');
      //   });
    });
  });
});
