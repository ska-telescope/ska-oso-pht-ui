import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import SensCalcDisplaySingle from '../../alerts/sensCalcDisplay/single/SensCalcDisplaySingle';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mountingBasic(theTheme: any, show: boolean) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <SensCalcDisplaySingle row={null} show={show} />
    </ThemeProvider>
  );
}

describe('<SensCalcDisplaySingle />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (basic)`, () => {
      mountingBasic(theTheme, false);
    });
  }
});
