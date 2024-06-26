/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { BrowserRouter } from 'react-router-dom';
import theme from '../../services/theme/theme';
import AddObservation from './AddObservation';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];

function verifyArrayConfiguration1AndSubArrayConfig() {
  cy.get('[data-testid="subarrayConfig"]').contains('subArrayConfiguration.1');
  cy.get('[data-testid="subarrayConfig"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="subarrayConfig"]').contains('subArrayConfiguration.2');
  cy.get('[data-testid="helpPanelId"]').contains('subArrayConfiguration.help');
}

/*
function verifyArrayConfiguration2AndSubArrayConfig() {
  cy.get('[data-testid="arrayConfig"]').contains('arrayConfiguration.1');
  cy.get('[data-testid="arrayConfig"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="arrayConfiguration"]').contains('arrayConfiguration.2');
  cy.get('[data-testid="helpPanelId"]').contains('arrayConfiguration.help');

  cy.get('[data-testid="subarrayConfig"]').contains('subArrayConfiguration.1');
  cy.get('[data-testid="subarrayConfig"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="subarrayConfig"]').contains('subArrayConfiguration.2');
  cy.get('[data-testid="helpPanelId"]').contains('subArrayConfiguration.help');
}
*/

function verifySuppliedTypeValueAndUnits() {
  cy.get('[data-testid="suppliedType"]').contains('Integration Time');
  cy.get('[data-testid="suppliedType"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="suppliedType"]').contains('Sensitivity');
  cy.get('[data-testid="helpPanelId"]').contains('suppliedType.help');

  cy.get('[data-testid="suppliedValue"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('suppliedValue.help');

  cy.get('[data-testid="suppliedUnits"]').contains('jy/beam');
  cy.get('[data-testid="suppliedUnits"]').click();
  cy.get('[data-value="5"]').click();
  cy.get('[data-testid="suppliedUnits"]').contains('K');
  cy.get('[data-testid="helpPanelId"]').contains('suppliedUnits.help');
}

function verifyElevationField() {
  cy.get('[id="elevation"]').type('15');
  cy.get('[data-testid="helpPanelId"]').contains('elevation.help');
}

function verifyWeatherField() {
  cy.get('[id="weather"]').type('30');
  cy.get('[data-testid="helpPanelId"]').contains('weather.help');
}

function verifyObservationTypeZoom() {
  cy.get('[data-testid="observationType"]').contains('observationType.1');
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="observationType"]').contains('observationType.0');
  cy.get('[data-testid="helpPanelId"]').contains('observationType.help');
}

function verifyObservationTypeContinuum() {
  cy.get('[data-testid="observationType"]').contains('observationType.1');
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="1"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('observationType.help');
}

function verifyCentralFrequency() {
  // cy.get('[data-testid="centralFrequency"]').type('test central frequency');
  // cy.get('[data-testid="helpPanelId"]').contains('centralFrequency.help');
}

function verifyObservingBand() {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="observingBand"]').contains('Band 2 (0.95 - 1.76 GHz)');
  cy.get('[data-testid="helpPanelId"]').contains('observingBand.help');
}

function verifyFrequencyUnits() {
  cy.get('[data-testid="frequencyUnits"]').contains('GHz');
  cy.get('[data-testid="frequencyUnits"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="frequencyUnits"]').contains('MHz');
  cy.get('[data-testid="helpPanelId"]').contains('frequencyUnits.help');
}

// TAS function verifyContinuumBandwidth() {
//   cy.get('[data-testid="continuumBandwidth"]').type('test continuum bandwidth frequency');
// cy.get('[data-testid="helpPanelId"]').contains('continuumBandWidth.help');
// }

function verifyContinuumUnits() {
  cy.get('[data-testid="continuumUnits"]').contains('GHz');
  // cy.get('[data-testid="continuumUnits"]').click();
  // cy.get('[data-value="2"]').click();
  // cy.get('[data-testid="frequencyUnits"]').contains('MHz');
  // cy.get('[data-testid="helpPanelId"]').contains('continuumUnits.help');
}

function verifyMidBandwidthFrequency() {
  // TAS cy.get('[data-testid="continuumBandwidth"] input#continuumBandwidth').should(
  // TAS   'contain.value',
  // TAS   'test continuum bandwidth frequency'
  // TAS );
  // cy.get('[data-testid="bandwidth"]').click();
  // cy.get('[data-value="2"]').click();
  // cy.get('[data-testid="bandwidth"]').contains('6.25 MHz');
  // cy.get('[data-testid="helpPanelId"]').contains('bandWidth.help');
}

function verifyLowBandwidthFrequency() {
  cy.get('[data-testid="bandwidth"]').contains('24.4 KHz');
  // cy.get('[data-testid="bandwidth"]').click();
  // cy.get('[data-value="2"]').click();
  // cy.get('[data-testid="bandwidth"]').contains('48.8 KHz');
  // cy.get('[data-testid="helpPanelId"]').contains('bandWidth.help');
}

function verifySpectralResolutionLow() {
  // cy.get('[data-testid="spectralResolution"]').contains('14.1 Hz');
  // cy.get('[data-testid="spectralResolution"]').click();
  // cy.get('[data-value="2"]').click();
  // cy.get('[data-testid="spectralResolution"]').contains('28.3 Hz');
  // cy.get('[data-testid="helpPanelId"]').contains('spectralResolution.help');
}

function verifySpectralResolutionMid() {
  // cy.get('[data-testid="spectralResolution"]').contains('0.21 KHz');
  // cy.get('[data-testid="spectralResolution"]').click();
  // cy.get('[data-value="2"]').click();
  // cy.get('[data-testid="spectralResolution"]').contains('0.42 KHz');
  // cy.get('[data-testid="helpPanelId"]').contains('spectralResolution.help');
}

function verifySpectralAveraging() {
  cy.get('[data-testid="spectral"]').contains('1');
}
function verifySpectralAveragingLow() {
  cy.get('[id="spectral"]').type('1');
  cy.get('[id="spectral"]').should('have.value', 11);
}

function verifyEffectiveResolution() {
  // cy.get('[data-testid="effective"]').type('test effective resolution');
  // cy.get('[data-testid="helpPanelId"]').contains('effectiveResolution.help');
}

function verifyTapering() {
  cy.get('[data-testid="tapering"]').contains('No tapering');
  // cy.get('[data-testid="tapering"]').click();
  // cy.get('[data-value="2"]').click();
  // cy.get('[data-testid="tapering"]').contains('0.250"');
  // cy.get('[data-testid="helpPanelId"]').contains('tapering.help');
}

function verifyImageWeighting() {
  cy.get('[data-testid="imageWeighting"]').contains('Uniform');
  // cy.get('[data-testid="imageWeighting"]').click();
  // cy.get('[data-value="0"]').click();
  // cy.get('[data-testid="imageWeighting"]').contains('Natural');
  // cy.get('[data-testid="helpPanelId"]').contains('imageWeighting.help');
}

function verifySubBands() {
  // cy.get('[data-testid="subBands"]').click();
  // cy.get('[data-testid="subBands"]').type('2');
  // cy.get('[data-testid="helpPanelId"]').contains('subBands.help');
}

function verifynumOf15mAntennas() {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="1"]').click();
  cy.get('[data-testid="subarrayConfig"]').click();
  cy.get('[data-value="20"]').click();
  cy.get('[data-testid="numOf15mAntennas"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('numOf15mAntennas.help');
}

function verifynumOf13mAntennas() {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="1"]').click();
  cy.get('[data-testid="subarrayConfig"]').click();
  cy.get('[data-value="20"]').click();
  cy.get('[data-testid="numOf13mAntennas"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('numOf13mAntennas.help');
}

function verifynumOfStations() {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="subarrayConfig"]').click();
  cy.get('[data-value="20"]').click();
  cy.get('[data-testid="numOfStations"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('numOfStations.help');
}

function verifyDetailsField() {
  cy.get('[data-testid="observationDetails"]').type('test observationDetails');
  cy.get('[data-testid="helpPanelId"]').contains('observationDetails.help');
}

function verifyGroupObservations() {
  cy.get('[data-testid="groupObservations"]').contains('groupObservations.none');
  cy.get('[data-testid="groupObservations"]').click();
  cy.get('[data-value="1"]').click();
  cy.get('[data-testid="groupObservations"]').contains('groupObservations.new');
  cy.get('[data-testid="helpPanelId"]').contains('groupObservations.help');
  cy.get('[data-testid="addGroupButton"]').click();
}

function mounting(theTheme: any) {
  cy.viewport(1500, 1500);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <BrowserRouter>
          <AddObservation />
        </BrowserRouter>
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<AddObservation />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }

  it('Verify the observation can be added to a group observation', () => {
    mounting(THEME_LIGHT);
    verifyGroupObservations();
    cy.get('[data-testid="addGroupButton"]').should('be.disabled');
    cy.get('[data-testid="groupObservations"]')
      .find('input')
      .should('be.disabled');
    cy.get('[data-testid="groupObservations"]').contains('groupObservations.idPrefix'); // displays the new group id
  });

  it('Verify user input available for observation type Continuum and Array Config MID', () => {
    mounting(THEME_LIGHT);
    verifyDetailsField();
    verifyArrayConfiguration1AndSubArrayConfig();
    verifyObservingBand();
    verifynumOf15mAntennas();
    verifynumOf13mAntennas();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequency();
    verifyFrequencyUnits();
    // TAS verifyContinuumBandwidth();
    verifyContinuumUnits();
    verifyMidBandwidthFrequency();
    verifySpectralResolutionMid();
    verifySpectralAveraging();
    verifyEffectiveResolution();
    verifyTapering();
    verifySubBands();
    verifyImageWeighting();
  });

  it('Verify user input available for observation type Zoom and Array Config MID', () => {
    mounting(THEME_LIGHT);
    verifyDetailsField();
    verifyArrayConfiguration1AndSubArrayConfig();
    verifyObservingBand();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeZoom();
    verifySuppliedTypeValueAndUnits();
    verifyFrequencyUnits();
    // verifyMidBandwidthFrequency();
    verifySpectralResolutionMid();
    verifySpectralAveraging();
    verifyEffectiveResolution();
    verifyTapering();
    verifyImageWeighting();
    verifynumOf15mAntennas();
    verifynumOf13mAntennas();
  });

  it('Verify user input available for observation type Zoom and Array Config LOW', () => {
    mounting(THEME_LIGHT);
    // verifyArrayConfiguration2AndSubArrayConfig();
    verifyDetailsField();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeZoom();
    verifySuppliedTypeValueAndUnits();
    verifyFrequencyUnits();
    verifyLowBandwidthFrequency();
    verifySpectralResolutionLow();
    verifySpectralAveragingLow();
    verifyEffectiveResolution();
    verifyTapering();
    verifyImageWeighting();
    verifynumOfStations();
  });

  it('Verify user input available for observation type Continuum and Array Config LOW', () => {
    mounting(THEME_LIGHT);
    // verifyArrayConfiguration2AndSubArrayConfig();
    verifyDetailsField();
    verifynumOfStations();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequency();
    verifyFrequencyUnits();
    // TAS verifyContinuumBandwidth();
    verifyContinuumUnits();
    verifyMidBandwidthFrequency();
    verifySpectralResolutionLow();
    verifySpectralAveragingLow();
    verifyEffectiveResolution();
    verifyTapering();
    verifySubBands();
    verifyImageWeighting();
  });
});
