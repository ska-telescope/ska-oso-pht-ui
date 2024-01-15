/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import AddObservation from './AddObservation';
import {BrowserRouter} from "react-router-dom";

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<AddObservation />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
            <BrowserRouter>
                <AddObservation />
            </BrowserRouter>
        </ThemeProvider>
      );
    });
  }
  it('Verify user input available', () => {
    cy.mount(
          <BrowserRouter>
            <AddObservation />
          </BrowserRouter>
    );
    // verify array configuration dropdown
      cy.get('[data-testid="arrayConfiguration"]').contains('MID');
      cy.get('[data-testid="arrayConfiguration"]').click();
      cy.get('[data-value="2"]').click();
      cy.get('[data-testid="arrayConfiguration"]').contains('LOW');
      cy.get('[data-testid="helpPanel"]').contains('ARRAY DESCRIPTION');

    // verify subarray configuration dropdown
    cy.get('[data-testid="subarrayConfiguration"]').contains('AA0.5');
    cy.get('[data-testid="subarrayConfiguration"]').click();
    cy.get('[data-value="2"]').click();
    cy.get('[data-testid="subarrayConfiguration"]').contains('AA1');
    cy.get('[data-testid="helpPanel"]').contains('SUBARRAY DESCRIPTION');

    // verify observing band dropdown
    cy.get('[data-testid="observingBand"]').contains('BAND 1');
    cy.get('[data-testid="helpPanel"]').contains('BAND  DESCRIPTION');

    // verify elevation field entry
    cy.get('[data-testid="elevation"]').click();
    cy.get('[data-testid="helpPanel"]').contains('ELEVATION DESCRIPTION');

    // verify weather field entry
    cy.get('[data-testid="weather"]').click();
    cy.get('[data-testid="helpPanel"]').contains('WEATHER DESCRIPTION');

    // verify observation type dropdown
    cy.get('[data-testid="helpPanel"]').contains('TYPE DESCRIPTION');

    // verify supplied type dropdown
    cy.get('[data-testid="helpPanel"]').contains('SUPPLIED TYPE DESCRIPTION');

    // verify supplied value dropdown
    cy.get('[data-testid="helpPanel"]').contains('SUPPLIED VALUE DESCRIPTION');

    // verify supplied units type dropdown
    cy.get('[data-testid="helpPanel"]').contains('SUPPLIED UNITS DESCRIPTION');

    // verify central frequency field entry
    cy.get('[data-testid="helpPanel"]').contains('FREQUENCY DESCRIPTION');

    // verify frequency units type dropdown
    cy.get('[data-testid="helpPanel"]').contains('FREQUENCY UNITS DESCRIPTION');

    // verify continuum bandwidth frequency field entry
    cy.get('[data-testid="helpPanel"]').contains('CONTINUUM BANDWIDTH DESCRIPTION');

    // verify continuum units type dropdown
    cy.get('[data-testid="helpPanel"]').contains('CONTINUUM UNITS DESCRIPTION');

    // verify bandwidth field entry
    cy.get('[data-testid="helpPanel"]').contains('BANDWIDTH DESCRIPTION');

    // verify spectral resolution dropdown
    cy.get('[data-testid="helpPanel"]').contains('SPECTRAL RESOLUTION DESCRIPTION');

    // verify spectral averaging dropdown
    cy.get('[data-testid="helpPanel"]').contains('SPECTRAL AVERAGING DESCRIPTION');

    // verify effective resolution field entry
    cy.get('[data-testid="helpPanel"]').contains('EFFECTIVE RESOLUTION DESCRIPTION');

    // verify tapering dropdown
    cy.get('[data-testid="helpPanel"]').contains('TAPERING DESCRIPTION');

    // verify number of sub bands field entry
    cy.get('[data-testid="helpPanel"]').contains('SUB-BANDS DESCRIPTION');

    // verify image weighting dropdown
    cy.get('[data-testid="helpPanel"]').contains('TAPERING  DESCRIPTION');
  });
});
