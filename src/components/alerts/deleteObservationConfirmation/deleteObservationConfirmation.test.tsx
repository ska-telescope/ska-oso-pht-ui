import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import DeleteObservationConfirmation from './deleteObservationConfirmation';
import { NEW_OBSERVATION } from '../../../utils/types/observation';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mountingDefault(theTheme: any) {
  viewPort();
  cy.mount(
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Router location="/" navigator={undefined}>
        <DeleteObservationConfirmation
          action={cy.stub().as('action')}
          observation={NEW_OBSERVATION}
          open
          setOpen={cy.stub().as('setOpen')}
        />
      </Router>
    </ThemeProvider>
  );
}

function validateContent() {
  cy.get('#alert-dialog-title').contains('deleteObservation.label');

  cy.get('#arrayConfigurationLabel').contains('arrayConfiguration.label');
  cy.get('#subArrayConfigurationLabel').contains('subArrayConfiguration.short');
  cy.get('#observationTypeLabel').contains('observationType.label');

  cy.get('#arrayConfigurationData').contains('arrayConfiguration.0');
  cy.get('#subArrayConfigurationData').contains('subArrayConfiguration.0');
  cy.get('#observationTypeData').contains('observationType.0');
  cy.get('#standardAlertId').contains('deleteObservation.info');

  cy.get('[data-testid="cancelButtonTestId"]').contains('button.cancel');
  cy.get('[data-testid="confirmButtonTestId"]').contains('button.confirm');
}

function cancelButtonClick() {
  cy.get('[data-testid="cancelButtonTestId"]').click();
}

function confirmButtonClick() {
  cy.get('[data-testid="confirmButtonTestId"]').click();
}

describe('<DeleteObservationConfirmation />', () => {
  for (const theTheme of THEME) {
    it(`Theme: ${theTheme}`, () => {
      mountingDefault(theTheme);
    });
    it(`-- Clicked Confirm`, () => {
      mountingDefault(theTheme);
      validateContent();
      confirmButtonClick();
    });
    it(`-- Clicked Cancel`, () => {
      mountingDefault(theTheme);
      validateContent();
      cancelButtonClick();
    });
  }
});
