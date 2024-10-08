import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import StarIcon from './starIcon';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const TOOLTIP = 'Tooltip';

function mountingDefault(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <StarIcon />
    </ThemeProvider>
  );
}

function mounting(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <StarIcon toolTip={TOOLTIP} />
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="starIcon"]').click();
}

function validateToolTip() {
  cy.get('[data-testid="starIcon"]').trigger('mouseover');
  cy.contains(TOOLTIP).should('be.visible');
}

describe('<StarIcon />', () => {
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
