import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import BaseButton from './Button';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';

function mountingBasic(theTheme: any) {
  cy.viewport(2000, 1000);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <BaseButton
        action={cy.stub().as('action')}
        icon={<AddIcon />}
        testId="testId"
        toolTip={TOOLTIP}
      />
    </ThemeProvider>
  );
}

function mounting(theTheme: any, disabled: boolean) {
  cy.viewport(2000, 1000);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <BaseButton
        action={cy.stub().as('action')}
        disabled={disabled}
        icon={<AddIcon />}
        testId="testId"
        title="BASE BUTTON"
        toolTip={TOOLTIP}
      />
    </ThemeProvider>
  );
}

function validateClick() {
  // cy.get('[data-testid="testId"]').click({ multiple: true });
}

function validateToolTip() {
  // cy.get('[data-testid="testId"]').trigger('mouseover');
  // cy.contains(TOOLTIP).should('be.visible');
}

describe('<BaseButton />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (basic)`, () => {
      mountingBasic(theTheme);
      validateClick();
      validateToolTip();
    });
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
