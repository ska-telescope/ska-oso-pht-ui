/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import MockProposal from '../../../services/axios/getProposal/mockProposal';
import theme from '../../../services/theme/theme';
import MemberInvite, {
  HELP_EMAIL,
  HELP_FIRST_NAME,
  HELP_LAST_NAME,
  HELP_PHD
} from './MemberInvite';
import {
  DEFAULT_HELP,
  TEAM_STATUS_TYPE_OPTIONS,
  TEXT_ENTRY_PARAMS
} from '../../../utils/constants';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<MemberInvite />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <MemberInvite
              help={DEFAULT_HELP}
              proposal={MockProposal}
              setHelp={cy.stub().as('setHelp')}
              setProposal={cy.stub().as('setProposal')}
            />
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
          <MemberInvite
            help={DEFAULT_HELP}
            proposal={MockProposal}
            setHelp={cy.stub().as('setHelp')}
            setProposal={cy.stub().as('setProposal')}
          />
        </ThemeProvider>
      </StoreProvider>
    );
  });

  describe('Stars', () => {
    it('Displays filled star for PI', () => {
      const index = MockProposal.team.findIndex(teamMember => teamMember.PI);
      if (index !== -1) {
        cy.get(
          `[data-testid="teamTableId"] div[data-rowindex="${index}"] div[data-field="PI"] [data-testid="StarRateRoundedIcon"]`
        ).should('exist');
      }
    });
    it('Displays border star for non PI accepted invitation', () => {
      const index = MockProposal.team.findIndex(
        teamMember => !teamMember.PI && teamMember.Status === TEAM_STATUS_TYPE_OPTIONS.accepted
      );
      if (index !== -1) {
        cy.get(
          `[data-testid="teamTableId"] div[data-rowindex="${index}"] div[data-field="PI"] [data-testid="StarBorderRoundedIcon"]`
        ).should('exist');
      }
    });
    it('Displays no star for pending invitation', () => {
      const index = MockProposal.team.findIndex(
        teamMember => teamMember.Status === TEAM_STATUS_TYPE_OPTIONS.pending
      );
      if (index !== -1) {
        cy.get(
          `[data-testid="teamTableId"] div[data-rowindex="${index}"] div[data-field="PI"]`
        ).should('be.empty');
      }
    });
  });

  describe('First Name Input', () => {
    it('First Name updated with user input', () => {
      const text = 'Jean-Jaques';
      cy.get('[data-testid="firstName"] input').type(text);
      cy.get('[data-testid="firstName"] input').then(input => {
        const updatedName = input.val();
        expect(updatedName).to.equal(text);
      });
    });
    it('First Name field displays error when incorrect input entered', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="firstName"] input').type(incorrectText);
      cy.get('[data-testid="firstName"] > p.Mui-error')
        .invoke('text')
        .then(helperText => {
          expect(helperText).to.equal(TEXT_ENTRY_PARAMS.DEFAULT.ERROR_TEXT);
        });
    });
    it('should clear the First Name helper text when text is cleared', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="firstName"] input').type(incorrectText);
      cy.get('[data-testid="firstName"] > p.Mui-error').should('exist');
      cy.get('[data-testid="firstName"] input').clear();
      cy.get('[data-testid="firstName"] > p.Mui-error').should('not.exist');
    });
    it('should set the First Name field to incorrect status when incorrect text is entered', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="firstName"] input').type(incorrectText);
      cy.get('[data-testid="firstName"] input').should('have.attr', 'aria-invalid', 'true');
    });
  });

  describe('Last Name Input', () => {
    it('Last Name updated with user input', () => {
      const text = 'Dupont';
      cy.get('[data-testid="lastName"] input').type(text);
      cy.get('[data-testid="lastName"] input').then(input => {
        const updatedName = input.val();
        expect(updatedName).to.equal(text);
      });
    });
    it('Last Name field displays error when incorrect input entered', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="lastName"] input').type(incorrectText);
      cy.get('[data-testid="lastName"] > p.Mui-error')
        .invoke('text')
        .then(helperText => {
          expect(helperText).to.equal(TEXT_ENTRY_PARAMS.DEFAULT.ERROR_TEXT);
        });
    });
    it('should clear the Last Name helper text when text is cleared', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="lastName"] input').type(incorrectText);
      cy.get('[data-testid="lastName"] > p.Mui-error').should('exist');
      cy.get('[data-testid="lastName"] input').clear();
      cy.get('[data-testid="lastName"] > p.Mui-error').should('not.exist');
    });
    it('should set the Last Name field to incorrect status when incorrect text is entered', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="lastName"] input').type(incorrectText);
      cy.get('[data-testid="lastName"] input').should('have.attr', 'aria-invalid', 'true');
    });
  });

  describe('Email Input', () => {
    it('Email updated with user input', () => {
      const text = 'jeandupont@gmail.com';
      cy.get('[data-testid="email"] input').type(text);
      cy.get('[data-testid="email"] input').then(input => {
        const updatedName = input.val();
        expect(updatedName).to.equal(text);
      });
    });
    it('Email field displays error when incorrect input entered', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="email"] input').type(incorrectText);
      cy.get('[data-testid="email"] > p.Mui-error')
        .invoke('text')
        .then(helperText => {
          expect(helperText).to.equal(TEXT_ENTRY_PARAMS.EMAIL.ERROR_TEXT);
        });
    });
    it('should clear the Email helper text when text is cleared', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="email"] input').type(incorrectText);
      cy.get('[data-testid="email"] > p.Mui-error').should('exist');
      cy.get('[data-testid="email"] input').clear();
      cy.get('[data-testid="email"] > p.Mui-error').should('not.exist');
    });
    it('should set the Email field to incorrect status when incorrect text is entered', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="email"] input').type(incorrectText);
      cy.get('[data-testid="email"] input').should('have.attr', 'aria-invalid', 'true');
    });
  });

  describe('Form Validation', () => {
    it('Button disabled if First Name input is empty', () => {
      cy.get('[data-testid="firstName"] input').clear();
      cy.get('[data-testid="button.sendInviteButton"]').should('be.visible');
    });
    it('Button disabled if Last Name input is empty', () => {
      cy.get('[data-testid="lastName"] input').clear();
      cy.get('[data-testid="button.sendInviteButton"]').should('be.visible');
    });
    it('Button disabled if Email input is empty', () => {
      cy.get('[data-testid="email"] input').clear();
      cy.get('[data-testid="button.sendInviteButton"]').should('be.visible');
    });
    it('Button disabled if Email has incorrect format', () => {
      const incorrectText = 'email@';
      cy.get('[data-testid="email"] input').type(incorrectText);
      cy.get('[data-testid="button.sendInviteButton"]').should('be.visible');
    });
    it('Button disabled if First Name has incorrect format', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="firstName"] input').type(incorrectText);
      cy.get('[data-testid="button.sendInviteButton"]').should('be.visible');
    });
    it('Button disabled if Last Name has incorrect format', () => {
      const incorrectText = 'XXX*%$';
      cy.get('[data-testid="lastName"] input').type(incorrectText);
      cy.get('[data-testid="button.sendInviteButton"]').should('be.visible');
    });
    it('Button NOT disabled if all fields have correct format', () => {
      const firstName = 'Alia';
      const lastName = 'Benammar';
      const email = 'alia123@gmail.com';
      cy.get('[data-testid="firstName"] input').type(firstName);
      cy.get('[data-testid="lastName"] input').type(lastName);
      cy.get('[data-testid="email"] input').type(email);
      cy.get('[data-testid="button.sendInviteButton"]').should('not.be.disabled');
    });
    it('Button clickable if all fields have correct format', () => {
      const firstName = 'Alia';
      const lastName = 'Benammar';
      const email = 'alia123@gmail.com';
      cy.get('[data-testid="firstName"] input').type(firstName);
      cy.get('[data-testid="lastName"] input').type(lastName);
      cy.get('[data-testid="email"] input').type(email);
      cy.get('[data-testid="button.sendInviteButton"]')
        .should('be.enabled')
        .click();
    });
  });

  describe('Contextual help', () => {
    it('Contextual help displayed when First Name input field on focus', () => {
      cy.get('[data-testid="firstName"] input').focus();
      cy.get('[data-testid="helpPanelId"]').contains('firstName.help');
    });
    it('Contextual help displayed when Last Name input field on focus', () => {
      cy.get('[data-testid="lastName"] input').focus();
      cy.get('[data-testid="helpPanelId"]').contains('lastName.help');

    });
    it('Contextual help displayed when Email input field on focus', () => {
      cy.get('[data-testid="email"] input').focus();
      cy.get('[data-testid="helpPanelId"]').contains('email.help');
    });
    it('Contextual help displayed when Phd checkbox on focus', () => {
      cy.get('[testid="PhDCheckbox"] input').focus();
      cy.get('[data-testid="helpPanelId"]').contains('phdThesis.help');
    });
  });

  describe('Add team member to data table', () => {
    it('Added team member should be displayed in table', () => {
      const firstName = 'Joe';
      const lastName = 'Whiteley';
      const email = 'joe.whitely@icloud.com';
      cy.get('[data-testid="firstName"] input').type(firstName);
      cy.get('[data-testid="lastName"] input').type(lastName);
      cy.get('[data-testid="email"] input').type(email);
      cy.get('[data-testid="button.sendInviteButton"]').click();
    });
  });
});
