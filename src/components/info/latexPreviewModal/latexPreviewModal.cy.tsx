import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import LatexPreviewModal from './latexPreviewModal';

const THEME = [THEME_DARK, THEME_LIGHT];

function mountingBasic(theTheme: any) {
  cy.viewport(1500, 1500);
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <LatexPreviewModal value={null} open={false} onClose={null} title="" />
    </ThemeProvider>
  );
}

describe('<LatexPreviewModal />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (basic)`, () => {
      mountingBasic(theTheme);
    });
  }
});
