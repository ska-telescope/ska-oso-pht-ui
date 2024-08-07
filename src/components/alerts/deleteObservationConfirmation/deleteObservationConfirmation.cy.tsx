/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import DeleteObservationConfirmation from './deleteObservationConfirmation';
import { NEW_OBSERVATION } from '../../../utils/types/observation';

const THEME = [THEME_DARK, THEME_LIGHT];

function mount(theTheme) {
  cy.viewport(2000, 1000);
  cy.mount(
    <StoreProvider>
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
    </StoreProvider>
  );
}

describe('<DeleteObservationConfirmation />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mount(theTheme);
    });
  }
});

describe('Content', () => {
  it('verify content', () => {
    mount(THEME_LIGHT);
    cy.get('#alert-dialog-title').contains('deleteObservation.label');

    cy.get('#arrayConfigurationLabel').contains('arrayConfiguration.label');
    cy.get('#subArrayConfigurationLabel').contains('subArrayConfiguration.short');
    cy.get('#observationTypeLabel').contains('observationType.label');

    cy.get('#arrayConfigurationData').contains('arrayConfiguration.0');
    cy.get('#subArrayConfigurationData').contains('subArrayConfiguration.0');
    cy.get('#observationTypeData').contains('observationType.0');
    cy.get('#deleteObservationContent').contains('deleteObservation.content1');

    cy.get('[data-testid="cancelButtonTestId"]').contains('button.cancel');
    cy.get('[data-testid="confirmButtonTestId"]').contains('button.confirm');
  });
});
