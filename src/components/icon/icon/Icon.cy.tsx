import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Download } from '@mui/icons-material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import Icon from './Icon';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';

function mounting(theTheme: any, disabled: boolean) {
  cy.viewport(1500, 1500);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Icon
        disabled={disabled}
        icon={<Download />}
        onClick={cy.stub().as('setValue')}
        testId="iconIcon"
        toolTip={TOOLTIP}
      />
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="iconIcon"]').click();
}

function validateToolTip() {
  cy.get('[data-testid="iconIcon"]').trigger('mouseover');
  cy.contains(TOOLTIP).should('be.visible');
}

describe('<Icon />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (enabled)`, () => {
      mounting(theTheme, true);
      validateClick();
      validateToolTip();
    });
    it(`Theme ${theTheme}: Renders (disabled)`, () => {
      mounting(theTheme, false);
      validateClick();
      validateToolTip();
    });
  }
});
