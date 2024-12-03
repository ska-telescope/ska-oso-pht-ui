/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../../services/theme/theme';
import TargetFileImport from './TargetFileImport';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../../utils/testing/cypress';

describe('<TargetFileImport />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <TargetFileImport raType={0} />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    viewPort();
    cy.mount(
      <StoreProvider>
        <ThemeProvider theme={theme(THEME[1])}>
          <CssBaseline />
          <TargetFileImport raType={0} />
        </ThemeProvider>
      </StoreProvider>
    );
  });

  it(`Verify upload button label`, () => {
    //   cy.get('[data-testid="csvUploadChooseButton"]').contains('uploadCsvBtn.label');
  });

  it(`Verify upload button to upload csv`, () => {
    cy.get('input[type="file"]').as('fileInput');

    cy.fixture('target_equatorial_valid.csv').then(fileContent => {
      cy.get('@fileInput').attachFile({
        fileContent: fileContent.toString(),
        fileName: 'target_equatorial_valid.csv',
        mimeType: 'text/csv'
      });
    });
    // cy.get('[data-testid="csvUploadFilename"]').contains('target_equatorial_valid.c...');
    //TODO: identify getTarget not iterable
    //cy.get('[data-testid="csvUploadUploadButton"]').click();
  });
});
