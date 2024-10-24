import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import ViewIcon from './viewIcon';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';

function viewPort() {
  cy.viewport(1500, 1000);
}

function mountingDefault(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <ViewIcon onClick={cy.stub().as('setValue')} />
    </ThemeProvider>
  );
}

function mounting(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <ViewIcon onClick={cy.stub().as('setValue')} toolTip={TOOLTIP} />
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="viewIcon"]').click();
}

function validateToolTip() {
  cy.get('[data-testid="viewIcon"]').trigger('mouseover');
  cy.contains(TOOLTIP).should('be.visible');
}

describe('<ViewIcon />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: DEFAULT`, () => {
      mountingDefault(theTheme);
      validateClick();
    });
  }
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
      validateClick();
      validateToolTip();
    });
  }
});
