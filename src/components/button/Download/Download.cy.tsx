import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import DownloadButton from './Download';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';

function mounting(theTheme: any, disabled: boolean) {
  cy.viewport(1500, 1500);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <DownloadButton
        action={cy.stub().as('action')}
        disabled={disabled}
        primary
        testId="testId"
        title="BUTTON"
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

describe('<DownloadButton />', () => {
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
