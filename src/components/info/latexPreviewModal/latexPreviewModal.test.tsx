import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import LatexPreviewModal from './latexPreviewModal';
import { THEME, viewPort } from '../../../utils/testing/cypress';

// eslint-disable-next-line prettier/prettier
const SOME_TEXT = '$c = pmsqrt{a^2 + b^2}$';

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

function clickOutside() {
  cy.get('body').click(0, 0);
}

function clickCloseButton() {}

describe('<LatexPreviewModal />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders (basic)`, () => {
      mountingBasic(theTheme);
      clickOutside();
      clickCloseButton();
    });
  }
});
