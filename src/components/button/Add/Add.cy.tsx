import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ButtonColorTypes, THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import Add from './Add';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';

function mounting(theTheme: any, disabled: boolean) {
  cy.viewport(1500, 1500);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Add
          action={cy.stub().as('setValue')}
          disabled={disabled}
          color={ButtonColorTypes.Secondary}
          testId="addButton"
          title="ADD BUTTON"
          toolTip={TOOLTIP}
        />
      </ThemeProvider>
    </StoreProvider>
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
