import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import StatusIconDisplay from './statusIcon';
import { STATUS_OK } from '../../../utils/constants';
import { THEME, viewPort } from '../../../utils/testing/cypress';

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
