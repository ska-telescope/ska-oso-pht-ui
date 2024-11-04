/*
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import ContinuumBandwidth from './continuumBandwidth';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const value = 0;

function mountBasic(theTheme: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <ContinuumBandwidth setValue={cy.stub().as('setValue')} value={value} />
      </ThemeProvider>
    </StoreProvider>
  );
}

function mountSized(theTheme: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <ContinuumBandwidth
          setValue={cy.stub().as('setValue')}
          value={value}
          suffix="SUFFIX"
          telescope={2} // low telescope
          observingBand={0} // low band
          continuumBandwidthUnits={1} // default low units
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyObservationTypeConfiguration(inValue: number) {
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="' + inValue + '"]').click();
}

describe('<ObservationType />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}`, () => {
      mountBasic(theTheme);
    });
    it(`Theme ${theTheme}, suffix`, () => {
      mountSized(theTheme);
      verifyObservationTypeConfiguration(1);
    });
  }
});


function verifyContinuumBandwidthContinuumOb1SubArrayValue20() {
    cy.get('[id="continuumBandwidth"]').should('have.value', 0.435);
    cy.get('[id="continuumBandwidth"]').click();
    cy.get('[data-testid="helpPanelId"]').contains('continuumBandWidth.help');
  }
  
  function verifyContinuumBandwidthContinuumOb5aSubArrayValue20() {
    cy.get('[id="continuumBandwidth"]').should('have.value', 3.9);
    cy.get('[id="continuumBandwidth"]').click();
    cy.get('[data-testid="helpPanelId"]').contains('continuumBandWidth.help');
  }
  
  function verifyContinuumBandwidthContinuumOb5bSubArrayValue20() {
    cy.get('[id="continuumBandwidth"]').should('have.value', 5);
    cy.get('[id="continuumBandwidth"]').click();
    cy.get('[data-testid="helpPanelId"]').contains('continuumBandWidth.help');
  }
  
  function verifyContinuumBandwidthContinuumLowBand() {
    cy.get('[id="continuumBandwidth"]').should('have.value', 300);
    cy.get('[id="continuumBandwidth"]').click();
    cy.get('[data-testid="helpPanelId"]').contains('continuumBandWidth.help');
  }
*/
