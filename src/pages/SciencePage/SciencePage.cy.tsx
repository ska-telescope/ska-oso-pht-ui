/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import SciencePage from './SciencePage';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<ScienceContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <SciencePage />
        </ThemeProvider>
      );
    });
  }
  it(`Verify upload file elements`, () => {
    cy.mount(<SciencePage />);
    cy.get('[data-testid="uploadPdfLabel"]').contains('Upload PDF');
    cy.get('[data-testid="SearchIcon"]').click();
  });

  it(`Verify pdf preview elements`, () => {
    cy.mount(<SciencePage />);
    cy.get('[data-testid="pdfPreviewLabel"]').contains('PDF Preview');
  });
});
