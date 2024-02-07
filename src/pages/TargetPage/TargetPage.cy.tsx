/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import TargetPage from './TargetPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<TargetContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <TargetPage />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
  it(`Verify target elements`, () => {
    cy.mount(<TargetPage />);
    cy.get('[data-testid="No specific Target"]').contains('No specific Target');
    cy.get('[data-testid="List of Targets"]').contains('List of Targets');
    cy.get('[data-testid="Target Mosaic"]').contains('Target Mosaic');
    cy.get('[data-testid="DeleteRoundedIcon"]').click({ multiple: true });

    cy.get('[data-testid="targetListColumns"]').contains('Name');
    cy.get('[data-testid="targetListColumns"]').contains('Right Ascension');
    cy.get('[data-testid="targetListColumns"]').contains('Declination');
    cy.get('[data-testid="targetListColumns"]').contains('Red Shift');

    cy.get('[testId="addTarget"]').contains('Add Target');
    cy.get('[testId="importFromFile"]').contains('Import From File');
    cy.get('[testId="spatialImaging"]').contains('Spatial Imaging');
  });
});
