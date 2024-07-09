import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import SensCalcDisplaySingle from './SensCalcDisplaySingle';

const THEME = [THEME_DARK, THEME_LIGHT];

function mountingBasic(theTheme: any, show: boolean) {
  cy.viewport(1500, 1500);
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