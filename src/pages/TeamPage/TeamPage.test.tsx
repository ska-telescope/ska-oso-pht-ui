import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../services/theme/theme';
import TeamPage from './TeamPage';
import { THEME, viewPort } from '../../utils/testing/cypress';

describe('<TeamPage />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <Router location="/" navigator={undefined}>
              <TeamPage />
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
          <TeamPage />
        </Router>
      </StoreProvider>
    );
  });

  // describe('First Name Input', () => {
  //   it('First Name updated with user input', () => {
  //     const text = 'Jean-Jaques';
  //     cy.get('[data-testid="firstName"] input').type(text);
  //     cy.get('[data-testid="firstName"] input').then(input => {
  //       const updatedName = input.val();
  //       expect(updatedName).to.equal(text);
  //     });
  //   });
  //   it('First Name field displays error when incorrect input entered', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="firstName"] input').type(incorrectText);
  //     cy.get('[data-testid="firstName"] > p.Mui-error')
  //       .invoke('text')
  //       .then(helperText => {
  //         expect(helperText).to.equal(TEXT_ENTRY_PARAMS.DEFAULT.ERROR_TEXT);
  //       });
  //   });
  //   it('should clear the First Name helper text when text is cleared', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="firstName"] input').type(incorrectText);
  //     cy.get('[data-testid="firstName"] > p.Mui-error').should('exist');
  //     cy.get('[data-testid="firstName"] input').clear();
  //     cy.get('[data-testid="firstName"] > p.Mui-error').should('not.exist');
  //   });
  //   it('should set the First Name field to incorrect status when incorrect text is entered', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="firstName"] input').type(incorrectText);
  //     cy.get('[data-testid="firstName"] input').should('have.attr', 'aria-invalid', 'true');
  //   });
  // });

  // describe('Last Name Input', () => {
  //   it('Last Name updated with user input', () => {
  //     const text = 'Dupont';
  //     cy.get('[data-testid="lastName"] input').type(text);
  //     cy.get('[data-testid="lastName"] input').then(input => {
  //       const updatedName = input.val();
  //       expect(updatedName).to.equal(text);
  //     });
  //   });
  //   it('Last Name field displays error when incorrect input entered', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="lastName"] input').type(incorrectText);
  //     cy.get('[data-testid="lastName"] > p.Mui-error')
  //       .invoke('text')
  //       .then(helperText => {
  //         expect(helperText).to.equal(TEXT_ENTRY_PARAMS.DEFAULT.ERROR_TEXT);
  //       });
  //   });
  //   it('should clear the Last Name helper text when text is cleared', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="lastName"] input').type(incorrectText);
  //     cy.get('[data-testid="lastName"] > p.Mui-error').should('exist');
  //     cy.get('[data-testid="lastName"] input').clear();
  //     cy.get('[data-testid="lastName"] > p.Mui-error').should('not.exist');
  //   });
  //   it('should set the Last Name field to incorrect status when incorrect text is entered', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="lastName"] input').type(incorrectText);
  //     cy.get('[data-testid="lastName"] input').should('have.attr', 'aria-invalid', 'true');
  //   });
  // });

  // describe('Email Input', () => {
  //   it('Email updated with user input', () => {
  //     const text = 'jeandupont@gmail.com';
  //     cy.get('[data-testid="email"] input').type(text);
  //     cy.get('[data-testid="email"] input').then(input => {
  //       const updatedName = input.val();
  //       expect(updatedName).to.equal(text);
  //     });
  //   });
  //   it('Email field displays error when incorrect input entered', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="email"] input').type(incorrectText);
  //     cy.get('[data-testid="email"] > p.Mui-error')
  //       .invoke('text')
  //       .then(helperText => {
  //         expect(helperText).to.equal(TEXT_ENTRY_PARAMS.EMAIL.ERROR_TEXT);
  //       });
  //   });
  //   it('should clear the Email helper text when text is cleared', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="email"] input').type(incorrectText);
  //     cy.get('[data-testid="email"] > p.Mui-error').should('exist');
  //     cy.get('[data-testid="email"] input').clear();
  //     cy.get('[data-testid="email"] > p.Mui-error').should('not.exist');
  //   });
  //   it('should set the Email field to incorrect status when incorrect text is entered', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="email"] input').type(incorrectText);
  //     cy.get('[data-testid="email"] input').should('have.attr', 'aria-invalid', 'true');
  //   });
  // });

  // describe('Form Validation', () => {
  //   it('Button disabled if First Name input is empty', () => {
  //     cy.get('[data-testid="firstName"] input').clear();
  //     cy.get('[data-testid="Send InvitationButton"]').should('be.disabled');
  //   });
  //   it('Button disabled if Last Name input is empty', () => {
  //     cy.get('[data-testid="lastName"] input').clear();
  //     cy.get('[data-testid="Send InvitationButton"]').should('be.disabled');
  //   });
  //   it('Button disabled if Email input is empty', () => {
  //     cy.get('[data-testid="email"] input').clear();
  //     cy.get('[data-testid="Send InvitationButton"]').should('be.disabled');
  //   });
  //   it('Button disabled if Email has incorrect format', () => {
  //     const incorrectText = 'email@';
  //     cy.get('[data-testid="email"] input').type(incorrectText);
  //     cy.get('[data-testid="Send InvitationButton"]').should('be.disabled');
  //   });
  //   it('Button disabled if First Name has incorrect format', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="firstName"] input').type(incorrectText);
  //     cy.get('[data-testid="Send InvitationButton"]').should('be.disabled');
  //   });
  //   it('Button disabled if Last Name has incorrect format', () => {
  //     const incorrectText = 'XXX*%$';
  //     cy.get('[data-testid="lastName"] input').type(incorrectText);
  //     cy.get('[data-testid="Send InvitationButton"]').should('be.disabled');
  //   });
  //   it('Button NOT disabled if all fields have correct format', () => {
  //     const firstName = 'Alia';
  //     const lastName = 'Benammar';
  //     const email = 'alia123@gmail.com';
  //     cy.get('[data-testid="firstName"] input').type(firstName);
  //     cy.get('[data-testid="lastName"] input').type(lastName);
  //     cy.get('[data-testid="email"] input').type(email);
  //     cy.get('[data-testid="Send InvitationButton"]').should('not.be.disabled');
  //   });
  //   it('Button clickable if all fields have correct format', () => {
  //     const firstName = 'Alia';
  //     const lastName = 'Benammar';
  //     const email = 'alia123@gmail.com';
  //     cy.get('[data-testid="firstName"] input').type(firstName);
  //     cy.get('[data-testid="lastName"] input').type(lastName);
  //     cy.get('[data-testid="email"] input').type(email);
  //     cy.get('[data-testid="Send InvitationButton"]')
  //       .should('be.enabled')
  //       .click();
  //   });
  // });

  describe('Contextual help', () => {
    /*
    // contextual help working when serving the app but not with cypress: test set up issue? to investigate
    it('Contextual help displayed when First Name input field on focus', () => {
      cy.get('[data-testid="firstName"] input').focus();
      cy.get('[data-testid="infoPanelId"] div.MuiCardHeader-content')
        .invoke('text')
        .then(helpTitle => {
          expect(helpTitle).to.equal(HELP_FIRST_NAME.title);
        });
    });
    it('Contextual help displayed when Last Name input field on focus', () => {
      cy.get('[data-testid="lastName"] input').focus();
      cy.get('[data-testid="infoPanelId"] div.MuiCardHeader-content')
        .invoke('text')
        .then(helpTitle => {
          expect(helpTitle).to.equal(HELP_LAST_NAME.title);
        });
    });
    it('Contextual help displayed when Email input field on focus', () => {
      cy.get('[data-testid="email"] input').focus();
      cy.get('[data-testid="infoPanelId"] div.MuiCardHeader-content')
        .invoke('text')
        .then(helpTitle => {
          expect(helpTitle).to.equal(HELP_EMAIL.title);
        });
    });
    it('Contextual help displayed when Phd checkbox on focus', () => {
      cy.get('[testid="PhDCheckbox"] input').focus();
      cy.get('[data-testid="infoPanelId"] div.MuiCardHeader-content')
        .invoke('text')
        .then(helpTitle => {
          expect(helpTitle).to.equal(HELP_PHD.title);
        });
    });
    */
  });

  describe('Add team member to data table', () => {
    /*
    TO DO
    // new member added to table when serving the app but not with cypress: test set up issue? to investigate
    it('Added team member should be displayed in table', () => {
      const firstName = 'Joe';
      const lastName = 'Whiteley';
      const email = 'joe.whitely@icloud.com';
      cy.get('[data-testid="firstName"] input').type(firstName);
      cy.get('[data-testid="lastName"] input').type(lastName);
      cy.get('[data-testid="email"] input').type(email);
      cy.get('[data-testid="Send InvitationButton"]').click();
      cy.get(`[data-testid="teamTableId"]`).contains(firstName);
      cy.get(`[data-testid="teamTableId"]`).contains(lastName);
    });
    */
  });
});
