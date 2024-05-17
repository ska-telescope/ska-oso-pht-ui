import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import EditIcon from './editIcon';

const THEME = [THEME_DARK, THEME_LIGHT];
const TOOLTIP = 'Tooltip';

function mounting(theTheme: any) {
  cy.viewport(1500, 1500);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <EditIcon onClick={cy.stub().as('setValue')} toolTip={TOOLTIP} />
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="editIcon"]').click();
}

function validateToolTip() {
  cy.get('[data-testid="editIcon"]').trigger('mouseover');
  cy.contains(TOOLTIP).should('be.visible');
}

describe('<EditIcon />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
      validateClick();
      validateToolTip();
    });
  }
});
