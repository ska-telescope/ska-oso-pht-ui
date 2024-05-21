import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import HomeButton from './HomeButton';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';

function mounting(theTheme: any, disabled: boolean) {
  cy.viewport(1500, 1500);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Router location="/" navigator={undefined} history={undefined}>
        <HomeButton disabled={disabled} primary testId="testId" title="BUTTON" toolTip={TOOLTIP} />
      </Router>
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="testId"]').click();
  cy.get('[data-testid="testId"]').should('not.be.disabled')
}

function validateDisabled() {
  cy.get('[data-testid="testId"]').should('be.disabled')
}

function validateToolTip() {
  cy.get('[data-testid="testId"]').trigger('mouseover');
  cy.contains(TOOLTIP).should('be.visible');
}

describe('<HomeButton />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (enabled)`, () => {
      mounting(theTheme, false);
      validateClick();
      validateToolTip();
    });
    it(`Theme ${theTheme}: Renders (disabled)`, () => {
      mounting(theTheme, true);
      validateDisabled();
    });
  }
});
