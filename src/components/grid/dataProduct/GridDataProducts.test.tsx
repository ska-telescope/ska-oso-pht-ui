import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import GridDataProducts from './GridDataProducts';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mounting(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <GridDataProducts baseObservations={null} />
    </ThemeProvider>
  );
}

describe('<GridDataProducts />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});
