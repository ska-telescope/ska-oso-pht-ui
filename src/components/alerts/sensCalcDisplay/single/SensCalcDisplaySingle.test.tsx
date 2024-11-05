import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../../services/theme/theme';
import SensCalcDisplaySingle from '../../sensCalcDisplay/single/SensCalcDisplaySingle';
import { THEME, viewPort } from '../../../../utils/testing/cypress';

function mounting(theTheme: any, sensCalc: any, show: boolean, field: string) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <SensCalcDisplaySingle sensCalc={sensCalc} show={show} field={field} />
    </ThemeProvider>
  );
}

describe('<SensCalcDisplaySingle />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (basic)`, () => {
      mounting(theTheme, 123, false, 'icon');
    });
  }
});
