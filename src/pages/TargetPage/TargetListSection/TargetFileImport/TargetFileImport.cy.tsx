/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../../services/theme/theme';
import TargetFileImport from './TargetFileImport';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];

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
    cy.mount(
      <StoreProvider>
        <ThemeProvider theme={theme(THEME_LIGHT)}>
          <CssBaseline />
          <TargetFileImport raType={0} />
        </ThemeProvider>
      </StoreProvider>
    );
  });

  it(`Verify upload button label`, () => {
    cy.get('[data-testid="csvUploadChooseButton"]').contains('uploadCsvBtn.label');
  });

  it(`Verify upload button to upload csv`, () => {
    cy.get('input[type="file"]').as('fileInput');

    cy.fixture('target.csv').then(fileContent => {
      cy.get('@fileInput').attachFile({
        fileContent: fileContent.toString(),
        fileName: 'target.csv',
        mimeType: 'text/csv'
      });
    });
    cy.get('[testid="csvUploadFilename"]').contains('target.csv');
    //TODO: identify getTarget not iterable
    //cy.get('[data-testid="csvUploadUploadButton"]').click();
  });
});
