import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import TrashIcon from './trashIcon';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const TOOLTIP = 'Tooltip';

function mountingDefault(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <TrashIcon onClick={cy.stub().as('setValue')} />
    </ThemeProvider>
  );
}

function mounting(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <TrashIcon onClick={cy.stub().as('setValue')} toolTip={TOOLTIP} />
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="trashIcon"]').click();
}

function validateToolTip() {
  cy.get('[data-testid="trashIcon"]').trigger('mouseover');
  cy.contains(TOOLTIP).should('be.visible');
}

describe('<TrashIcon />', () => {
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
