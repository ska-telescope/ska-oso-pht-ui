import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import LatexPreviewModal from './latexPreviewModal';

const THEME = [THEME_DARK, THEME_LIGHT];

const SOME_TEXT = 'THIS IS SOME DUMMY TEXT';

function viewPort() {
  cy.viewport(1500, 1000);
}

function mountingBasic(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <LatexPreviewModal
        value={SOME_TEXT}
        open={true}
        onClose={cy.stub().as('onClose')}
        title="DUMMY TITLE"
      />
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
