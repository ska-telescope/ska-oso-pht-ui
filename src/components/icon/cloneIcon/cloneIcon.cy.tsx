import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import CloneIcon from './cloneIcon';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';

function mounting(theTheme: any, toolTip: string) {
  cy.viewport(2000, 1000);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <CloneIcon onClick={cy.stub().as('setValue')} toolTip={toolTip} />
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="cloneIcon"]').click();
}

function validateToolTip() {
  cy.get('[data-testid="cloneIcon"]').trigger('mouseover');
  cy.contains(TOOLTIP).should('be.visible');
}

describe('<CloneIcon />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme, '');
    });

    it('Checking the ToolTip', () => {
      mounting(theTheme, TOOLTIP);
      validateClick();
      validateToolTip();
    });
  }
});
