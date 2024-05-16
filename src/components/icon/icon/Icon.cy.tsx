import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Download } from '@mui/icons-material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import Icon from './Icon';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';

function mounting(theTheme: any) {
  cy.viewport(1500, 1500);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Icon
          onClick={cy.stub().as('setValue')}
          icon={<Download />}
          testId="iconIcon"
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
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
      validateClick();
      validateToolTip();
    });
  }
});
