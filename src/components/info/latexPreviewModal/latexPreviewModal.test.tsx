import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import LatexPreviewModal from './latexPreviewModal';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const SOME_TEXT = 'THIS IS SOME DUMMY TEXT';

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
