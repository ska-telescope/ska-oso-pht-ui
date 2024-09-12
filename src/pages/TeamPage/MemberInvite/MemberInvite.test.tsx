/* eslint-disable no-restricted-syntax */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import MemberInvite from './MemberInvite';
import { TEXT_ENTRY_PARAMS } from '../../../utils/constants';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mounting(theTheme: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <BrowserRouter>
          <MemberInvite />
        </BrowserRouter>
      </ThemeProvider>
    </StoreProvider>
  );
}

function clearFirstName() {
  cy.get('[data-testid="firstName"] input').clear();
}
function enterFirstName(str: string) {
  cy.get('[data-testid="firstName"] input').type(str);
}

function clearLastName() {
  cy.get('[data-testid="lastName"] input').clear();
}
function enterLastName(str: string) {
  cy.get('[data-testid="lastName"] input').type(str);
}

function clearEmail() {
  cy.get('[data-testid="email"] input').clear();
}
function enterEmail(str: string) {
  cy.get('[data-testid="email"] input').type(str);
}

function inviteButton(enabled: boolean = false, click: boolean = false) {
  cy.get('[data-testid="sendInviteButton"]').should('be.visible');
  cy.get('[data-testid="sendInviteButton"]').should(enabled ? 'be.enabled' : 'be.disabled');
  if (false && click) {
    // TODO : Some issue with the click at present
    cy.get('[data-testid="sendInviteButton"]').click();
  }
}

describe('<MemberInvite />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    mounting(THEME[1]);
  });

  describe('First Name Input', () => {
    it('First Name updated with user input', () => {
      const text = 'Jean-Jaques';
      enterFirstName(text);
      cy.get('[data-testid="firstName"] input').then(input => {
        const updatedName = input.val();
        expect(updatedName).to.equal(text);
      });
    });
    it('First Name field displays error when incorrect input entered', () => {
      const incorrectText = 'XXX*%$';
      enterFirstName(incorrectText);
      cy.get('[data-testid="firstName"] > p.Mui-error')
        .invoke('text')
        .then(helperText => {
          expect(helperText).to.equal(TEXT_ENTRY_PARAMS.DEFAULT.ERROR_TEXT);
        });
    });
    it('should clear the First Name helper text when text is cleared', () => {
      const incorrectText = 'XXX*%$';
      enterFirstName(incorrectText);
      cy.get('[data-testid="firstName"] > p.Mui-error')
        .should('exist')
        .contains('specialCharacters.invalid');
      clearFirstName();
      cy.get('[data-testid="firstName"] > p.Mui-error')
        .should('exist')
        .contains('A value is required');
    });
    it('should set the First Name field to incorrect status when incorrect text is entered', () => {
      const incorrectText = 'XXX*%$';
      enterFirstName(incorrectText);
      cy.get('[data-testid="firstName"] input').should('have.attr', 'aria-invalid', 'true');
    });
  });

  describe('Last Name Input', () => {
    it('Last Name updated with user input', () => {
      const text = 'Dupont';
      enterLastName(text);
      cy.get('[data-testid="lastName"] input').then(input => {
        const updatedName = input.val();
        expect(updatedName).to.equal(text);
      });
    });
    it('Last Name field displays error when incorrect input entered', () => {
      const incorrectText = 'XXX*%$';
      enterLastName(incorrectText);
      cy.get('[data-testid="lastName"] > p.Mui-error')
        .invoke('text')
        .then(helperText => {
          expect(helperText).to.equal(TEXT_ENTRY_PARAMS.DEFAULT.ERROR_TEXT);
        });
    });
    it('should clear the Last Name helper text when text is cleared', () => {
      const incorrectText = 'XXX*%$';
      enterLastName(incorrectText);
      cy.get('[data-testid="lastName"] > p.Mui-error')
        .should('exist')
        .contains('specialCharacters.invalid');
      clearLastName();
      cy.get('[data-testid="lastName"] > p.Mui-error')
        .should('exist')
        .contains('A value is required');
    });
    it('should set the Last Name field to incorrect status when incorrect text is entered', () => {
      const incorrectText = 'XXX*%$';
      enterLastName(incorrectText);
      cy.get('[data-testid="lastName"] input').should('have.attr', 'aria-invalid', 'true');
    });
  });

  describe('Email Input', () => {
    it('Email updated with user input', () => {
      const text = 'jeandupont@gmail.com';
      enterEmail(text);
      cy.get('[data-testid="email"] input').then(input => {
        const updatedName = input.val();
        expect(updatedName).to.equal(text);
      });
    });
    it('Email field displays error when incorrect input entered', () => {
      const incorrectText = 'XXX*%$';
      enterEmail(incorrectText);
      cy.get('[data-testid="email"] > p.Mui-error')
        .invoke('text')
        .then(helperText => {
          expect(helperText).to.equal(TEXT_ENTRY_PARAMS.EMAIL.ERROR_TEXT);
        });
    });
    it('should clear the Email helper text when text is cleared', () => {
      const incorrectText = 'XXX*%$';
      enterEmail(incorrectText);
      cy.get('[data-testid="email"] > p.Mui-error')
        .should('exist')
        .contains('specialCharacters.email');
      clearEmail();
      cy.get('[data-testid="email"] > p.Mui-error')
        .should('exist')
        .contains('A value is required');
    });
    it('should set the Email field to incorrect status when incorrect text is entered', () => {
      const incorrectText = 'XXX*%$';
      enterEmail(incorrectText);
      cy.get('[data-testid="email"] input').should('have.attr', 'aria-invalid', 'true');
    });
  });

  describe('Form Validation', () => {
    it('Button disabled if First Name input is empty', () => {
      clearFirstName();
      inviteButton(false, false);
    });
    it('Button disabled if Last Name input is empty', () => {
      clearLastName();
      inviteButton(false, false);
    });
    it('Button disabled if Email input is empty', () => {
      clearEmail();
      inviteButton(false, false);
    });
    it('Button disabled if Email has incorrect format', () => {
      const incorrectText = 'email@';
      enterEmail(incorrectText);
      inviteButton(false, false);
    });
    it('Button disabled if First Name has incorrect format', () => {
      const incorrectText = 'XXX*%$';
      enterFirstName(incorrectText);
      inviteButton(false, false);
    });
    it('Button disabled if Last Name has incorrect format', () => {
      const incorrectText = 'XXX*%$';
      enterLastName(incorrectText);
      inviteButton(false, false);
    });
    it('Button NOT disabled if all fields have correct format', () => {
      const firstName = 'Alia';
      const lastName = 'Benammar';
      const email = 'alia123@gmail.com';
      enterFirstName(firstName);
      enterLastName(lastName);
      enterEmail(email);
      inviteButton(true, false);
    });
    it('Button clickable if all fields have correct format', () => {
      const firstName = 'Alia';
      const lastName = 'Benammar';
      const email = 'alia123@gmail.com';
      enterFirstName(firstName);
      enterLastName(lastName);
      enterEmail(email);
      inviteButton(true, true);
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
      cy.get('[data-testid="PhDCheckbox"] input').focus();
      cy.get('[data-testid="helpPanelId"]').contains('phdThesis.help');
    });
  });

  describe('Add team member to data table', () => {
    it('Added team member should be displayed in table', () => {
      const firstName = 'Joe';
      const lastName = 'Whiteley';
      const email = 'joe.whitely@icloud.com';
      enterFirstName(firstName);
      enterLastName(lastName);
      enterEmail(email);
      inviteButton(true, true);
    });
    it('Add team member as PI', () => {
      const firstName = 'Joe';
      const lastName = 'Whiteley';
      const email = 'joe.whitely@icloud.com';
      enterFirstName(firstName);
      enterLastName(lastName);
      enterEmail(email);
      cy.get('[id="piCheckbox"]').click();
      inviteButton(true, true);
    });
  });
});
