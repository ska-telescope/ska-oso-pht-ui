/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { BrowserRouter } from 'react-router-dom';
import theme from '../../services/theme/theme';
import AddObservation from './AddObservation';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];

function verifySubArrayConfigurationValue2() {
  cy.get('[data-testid="subarrayConfig"]').contains('subArrayConfiguration.1');
  cy.get('[data-testid="subarrayConfig"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="subarrayConfig"]').contains('subArrayConfiguration.2');
  cy.get('[data-testid="helpPanelId"]').contains('subArrayConfiguration.help');
}

function verifySubArrayConfigurationCustom() {
  cy.get('[data-testid="subarrayConfig"]').click();
  cy.get('[data-value="20"]').click();
  cy.get('[data-testid="subarrayConfig"]').contains('subArrayConfiguration.20');
  cy.get('[data-testid="helpPanelId"]').contains('subArrayConfiguration.help');
}

function verifyObservingBandLow() {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="observingBand"]').contains('Low Band (50 - 350 MHz)');
  cy.get('[data-testid="helpPanelId"]').contains('observingBand.help');
}

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

function verifyCentralFrequencyContinuumOb1SubArrayValue20() {
  cy.get('[id="frequency"]').should('have.value', 0.7975);
  cy.get('[id="frequency"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('centralFrequency.help');
}

function verifyCentralFrequencyContinuumOb5aSubArrayValue20() {
  cy.get('[id="frequency"]').should('have.value', 6.55);
  cy.get('[id="frequency"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('centralFrequency.help');
}
function verifyCentralFrequencyContinuumOb5bSubArrayValue20() {
  cy.get('[id="frequency"]').should('have.value', 11.85);
  cy.get('[id="frequency"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('centralFrequency.help');
}
function verifyCentralFrequencyContinuumLowBand() {
  cy.get('[id="frequency"]').should('have.value', 200);
  cy.get('[id="frequency"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('centralFrequency.help');
}

function verifyObservingBandMidBand2() {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="observingBand"]').contains('Band 2 (0.95 - 1.76 GHz)');
  cy.get('[data-testid="helpPanelId"]').contains('observingBand.help');
}

function verifyObservingBandMidBand5a() {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="3"]').click();
  cy.get('[data-testid="observingBand"]').contains('Band 5a (4.6 - 8.5 GHz)');
  cy.get('[data-testid="helpPanelId"]').contains('observingBand.help');
}

function verifyObservingBandMidBand5b() {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="4"]').click();
  cy.get('[data-testid="observingBand"]').contains('Band 5b (8.3 - 15.4 GHz)');
  cy.get('[data-testid="helpPanelId"]').contains('observingBand.help');
}

function verifyFrequencyUnits() {
  cy.get('[data-testid="frequencyUnits"]').contains('GHz');
  cy.get('[data-testid="frequencyUnits"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="frequencyUnits"]').contains('MHz');
  cy.get('[data-testid="helpPanelId"]').contains('frequencyUnits.help');
}

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
function verifyFrequencyUnitsLow() {
  cy.get('[data-testid="frequencyUnits"]').contains('MHz');
  cy.get('[data-testid="frequencyUnits"]')
    .find('input[type="text"]')
    .should('have.attr', 'type', 'text');
  cy.get('[data-testid="frequencyUnits"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('frequencyUnits.help');
}

function verifyContinuumUnits() {
  cy.get('[data-testid="continuumUnits"]').contains('GHz');
  cy.get('[data-testid="continuumUnits"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="frequencyUnits"]').contains('MHz');
  cy.get('[data-testid="helpPanelId"]').contains('continuumUnits.help');
}

function verifyLowBandwidthFrequency() {
  cy.get('[data-testid="bandwidth"]').contains('24.4 KHz');
  cy.get('[data-testid="bandwidth"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="bandwidth"]').contains('48.8 KHz');
  cy.get('[data-testid="helpPanelId"]').contains('bandWidth.help');
}

function verifySpectralResolutionLow() {
  cy.get('[id="spectralResolution"]').should('have.value', '5.43 kHz (8.1 km/s)');
  cy.get('[id="spectralResolution"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('spectralResolution.help');
}

function verifySpectralResolutionContinuumOb1SubArrayValue20() {
  cy.get('[id="spectralResolution"]').should('have.value', '13.44 kHz (5.1 km/s)');
  cy.get('[id="spectralResolution"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('spectralResolution.help');
}

function verifySpectralResolutionContinuumOb5aSubArrayValue20() {
  cy.get('[id="spectralResolution"]').should('have.value', '13.44 kHz (615.1 m/s)');
  cy.get('[id="spectralResolution"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('spectralResolution.help');
}

function verifySpectralResolutionContinuumOb5bSubArrayValue20() {
  cy.get('[id="spectralResolution"]').should('have.value', '13.44 kHz (340.0 m/s)');
  cy.get('[id="spectralResolution"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('spectralResolution.help');
}

function verifySpectralResolutionZoomBandMid() {
  cy.get('[id="spectralResolution"]').should('have.value', '13.44 kHz (3.0 km/s)');
  cy.get('[id="spectralResolution"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('spectralResolution.help');
}

function verifySpectralAveraging() {
  cy.get('[data-testid="spectral"]').contains('1');
}
function verifySpectralAveragingLow() {
  cy.get('[id="spectral"]').click();
  cy.get('[id="spectral"]').should('have.value', '1');
}

function verifyEffectiveResolutionContinuumOb1SubArrayValue20() {
  cy.get('[id="effective"]').should('have.value', '13.44 kHz (5.1 km/s)');
  cy.get('[id="effective"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('effectiveResolution.help');
}

function verifyEffectiveResolutionContinuumOb5aSubArrayValue20() {
  cy.get('[id="effective"]').should('have.value', '13.44 kHz (615.1 m/s)');
  cy.get('[id="effective"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('effectiveResolution.help');
}
function verifyEffectiveResolutionContinuumOb5bSubArrayValue20() {
  cy.get('[id="effective"]').should('have.value', '13.44 kHz (340.0 m/s)');
  cy.get('[id="effective"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('effectiveResolution.help');
}

function verifyEffectiveResolutionZoomMidBand() {
  cy.get('[id="effective"]').should('have.value', '13.44 kHz (3.0 km/s)');
  cy.get('[id="effective"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('effectiveResolution.help');
}

function verifyEffectiveResolutionContinuumLowBand() {
  cy.get('[id="effective"]').should('have.value', '5.43 kHz (8.1 km/s)');
  cy.get('[id="effective"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('effectiveResolution.help');
}

function verifyTapering() {
  cy.get('[data-testid="tapering"]').contains('No tapering');
  cy.get('[data-testid="tapering"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="tapering"]').contains('0.250"');
  cy.get('[data-testid="helpPanelId"]').contains('tapering.help');
}

function verifyImageWeighting() {
  cy.get('[data-testid="imageWeighting"]').contains('Uniform');
  cy.get('[data-testid="imageWeighting"]').click();
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="imageWeighting"]').contains('Natural');
  cy.get('[data-testid="helpPanelId"]').contains('imageWeighting.help');
}

function verifySubBands() {
  cy.get('[id="subBands"]').should('have.value', 1);
  cy.get('[id="subBands"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('subBands.help');
}

function verifyNumOf15mAntennas() {
  //change of band needed to enable antenna field
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="1"]').click();
  cy.get('[data-testid="subarrayConfig"]').click();
  cy.get('[data-value="20"]').click();
  cy.get('[data-testid="numOf15mAntennas"]').click();
  //verify value when active
  cy.get('[data-testid="helpPanelId"]').contains('numOf15mAntennas.help');
}

function verifyNumOf13mAntennas() {
  cy.get('[data-testid="numOf13mAntennas"]').click();
  //verify value when active
  cy.get('[data-testid="helpPanelId"]').contains('numOf13mAntennas.help');
}

function verifyNumOfStations() {
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

  it('Verify user input available for observation type Continuum and Array Config MID (Observing Band 1 & SubArrayValue 20)', () => {
    mounting(THEME_LIGHT);
    verifyObservingBandMidBand2();
    verifySubArrayConfigurationValue2();
    verifyNumOf15mAntennas();
    verifyNumOf13mAntennas();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequencyContinuumOb1SubArrayValue20();
    verifyFrequencyUnits();
    verifyContinuumBandwidthContinuumOb1SubArrayValue20();
    verifyContinuumUnits();
    verifySpectralResolutionContinuumOb1SubArrayValue20();
    verifySpectralAveraging();
    verifyEffectiveResolutionContinuumOb1SubArrayValue20();
    verifyTapering();
    verifySubBands();
    verifyImageWeighting();
    verifyDetailsField();
  });

  it('Verify user input available for observation type Continuum and Array Config MID (Observing Band 5a & SubArrayValue 20)', () => {
    mounting(THEME_LIGHT);
    verifyObservingBandMidBand5a();
    verifySubArrayConfigurationCustom();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequencyContinuumOb5aSubArrayValue20();
    verifyFrequencyUnits();
    verifyContinuumBandwidthContinuumOb5aSubArrayValue20();
    verifyContinuumUnits();
    verifySpectralResolutionContinuumOb5aSubArrayValue20();
    verifySpectralAveraging();
    verifyEffectiveResolutionContinuumOb5aSubArrayValue20();
    verifyTapering();
    verifySubBands();
    verifyImageWeighting();
    verifyDetailsField();
  });

  it('Verify user input available for observation type Continuum and Array Config MID (Observing Band 5b & SubArrayValue 20)', () => {
    mounting(THEME_LIGHT);
    verifyObservingBandMidBand5b();
    verifySubArrayConfigurationCustom();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequencyContinuumOb5bSubArrayValue20();
    verifyFrequencyUnits();
    verifyContinuumBandwidthContinuumOb5bSubArrayValue20();
    verifyContinuumUnits();
    verifySpectralResolutionContinuumOb5bSubArrayValue20();
    verifySpectralAveraging();
    verifyEffectiveResolutionContinuumOb5bSubArrayValue20();
    verifyTapering();
    verifySubBands();
    verifyImageWeighting();
    verifyDetailsField();
  });

  it('Verify user input available for observation type Zoom and Array Config MID', () => {
    mounting(THEME_LIGHT);
    verifyDetailsField();
    verifySubArrayConfigurationValue2();
    verifyObservingBandMidBand2();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeZoom();
    verifySuppliedTypeValueAndUnits();
    verifyFrequencyUnits();
    verifySpectralResolutionZoomBandMid();
    verifySpectralAveraging();
    verifyEffectiveResolutionZoomMidBand();
    verifyTapering();
    verifyImageWeighting();
    verifyNumOf15mAntennas();
    verifyNumOf13mAntennas();
  });

  it('Verify user input available for observation type Zoom and Array Config LOW', () => {
    mounting(THEME_LIGHT);
    verifyObservingBandLow();
    verifyDetailsField();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeZoom();
    verifySuppliedTypeValueAndUnits();
    verifyFrequencyUnitsLow();
    verifyLowBandwidthFrequency();
    verifySpectralResolutionLow();
    verifySpectralAveragingLow();
    verifyEffectiveResolutionContinuumLowBand();
    verifyTapering();
    verifyImageWeighting();
    verifyNumOfStations();
  });

  it('Verify user input available for observation type Continuum and Array Config LOW', () => {
    mounting(THEME_LIGHT);
    verifyObservingBandLow();
    verifySubArrayConfigurationValue2();
    verifyDetailsField();
    verifyNumOfStations();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequencyContinuumLowBand();
    verifyContinuumBandwidthContinuumLowBand();
    verifyFrequencyUnitsLow();
    verifyContinuumUnits();
    verifySpectralResolutionLow();
    verifySpectralAveragingLow();
    verifyEffectiveResolutionContinuumLowBand();
    verifyTapering();
    verifySubBands();
    verifyImageWeighting();
  });
});
