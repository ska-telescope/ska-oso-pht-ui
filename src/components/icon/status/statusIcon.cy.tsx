import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import StatusIconDisplay from './statusIcon';
import { STATUS_OK } from '../../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];

function viewPort() {
  cy.viewport(1500, 1000);
}

function mounting(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <StatusIconDisplay error="" level={STATUS_OK} onClick={cy.stub().as('onClick')} />
    </ThemeProvider>
  );
}

function validateClick() {
  cy.get('[data-testid="statusId"]').click();
}

describe('<Icon />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
      validateClick();
    });
  }
});
