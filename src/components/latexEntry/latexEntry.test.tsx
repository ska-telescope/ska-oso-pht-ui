import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../services/theme/theme';
import LatexEntry from './latexEntry';
import { THEME, viewPort } from '../../utils/testing/cypress';

function mountingBasic(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <LatexEntry value={null} setValue={null} setModal={null} />
    </ThemeProvider>
  );
}

describe('<LatexEntry />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (basic)`, () => {
      mountingBasic(theTheme);
    });
  }
});
