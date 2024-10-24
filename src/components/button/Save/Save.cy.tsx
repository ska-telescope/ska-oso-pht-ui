import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import SaveButton from './Save';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';
const TITLE = 'BASE BUTTON';

const DISABLED = [true, false];
const PRIMARY = [true, false];

function viewPort() {
  cy.viewport(1500, 1000);
}

function mountingDefault(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Router location="/" navigator={undefined}>
        <SaveButton action={'action URL'} />
      </Router>
    </ThemeProvider>
  );
}

function mountingAction(theTheme: any, disabled: boolean, primary: boolean) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Router location="/" navigator={undefined}>
        <SaveButton
          action={cy.stub().as('action')}
          disabled={disabled}
          primary={primary}
          title={TITLE}
          toolTip={TOOLTIP}
        />
      </Router>
    </ThemeProvider>
  );
}

function mountingURL(theTheme: any, disabled: boolean, primary: boolean) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Router location="/" navigator={undefined}>
        <SaveButton
          action={'dummy URL'}
          disabled={disabled}
          primary={primary}
          title={TITLE}
          toolTip={TOOLTIP}
        />
      </Router>
    </ThemeProvider>
  );
}

function validate(inLabel, inToolTip) {
  cy.get('[data-testid="baseButtonTestId"]').contains(inLabel);
  cy.get('[aria-label="' + inToolTip + '"]').trigger('mouseover');
  cy.contains(inToolTip).should('be.visible');
}

function clickButton() {
  cy.get('[aria-label="' + TOOLTIP + '"]').click();
}

function buttonDisabled() {
  // cy.get('[data-testid="baseButtonTestId"]').should('be.disabled');
}

describe('<BaseButton />', () => {
  for (const theTheme of THEME) {
    it(`Theme: ${theTheme} | disabled: DEFAULT | primary: DEFAULT`, () => {
      mountingDefault(theTheme);
    });
  }

  for (const theTheme of THEME) {
    for (const disabled of DISABLED) {
      for (const primary of PRIMARY) {
        it(`Theme: ${theTheme} | disabled: ${disabled} | primary: ${primary}`, () => {
          mountingAction(theTheme, disabled, primary);
          validate(TITLE, TOOLTIP);
          if (disabled) {
            buttonDisabled();
          } else {
            clickButton();
          }
        });
      }
    }
  }

  for (const theTheme of THEME) {
    for (const disabled of DISABLED) {
      for (const primary of PRIMARY) {
        it(`Theme: ${theTheme} | disabled: ${disabled} | primary: ${primary}`, () => {
          mountingURL(theTheme, disabled, primary);
          validate(TITLE, TOOLTIP);
          if (disabled) {
            buttonDisabled();
          } else {
            clickButton();
          }
        });
      }
    }
  }
});
