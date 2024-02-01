/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { BrowserRouter } from 'react-router-dom';
import theme from '../../services/theme/theme';
import ObservationPage from './ObservationPage';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<ObservationContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <BrowserRouter>
            <ObservationPage />
          </BrowserRouter>
        </ThemeProvider>
      );
    });
  }
  it(`Renders`, () => {
    cy.mount(
      <BrowserRouter>
        <ObservationPage />
      </BrowserRouter>
    );
    cy.get('[data-testid="Add observationButton"]').click();
    cy.get('[data-testid="observationDetails"]').should('contain', 'Telescope');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Subarray');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Type');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Actions');

    cy.get('[data-testid="observationDetails"]').should('contain', 'MID');
    cy.get('[data-testid="observationDetails"]').should('contain', 'subarray');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Continuum');

    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Name');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Right Ascension');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Declination');

    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Target 3');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', '05:30:00');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', '-10:00:00');
  });
});
