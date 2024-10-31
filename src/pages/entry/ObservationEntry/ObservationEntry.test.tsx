/* eslint-disable no-restricted-syntax */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import ObservationEntry from './ObservationEntry';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { BANDWIDTH_TELESCOPE } from '../../../utils/constants';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function mount(theTheme: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <BrowserRouter>
          <ObservationEntry />
        </BrowserRouter>
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyObservingBand(dataValue: number) {
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="' + dataValue + '"]').click();
  cy.get('[data-testid="observingBand"]').contains(BANDWIDTH_TELESCOPE[dataValue].label);
  cy.get('[data-testid="helpPanelId"]').contains('observingBand.help');
}

function verifySubArrayConfiguration(inValue: number) {
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="' + inValue + '"]').click();
  cy.get('[data-testid="subArrayConfiguration"]').contains('subArrayConfiguration.' + inValue);
  cy.get('[data-testid="helpPanelId"]').contains('subArrayConfiguration.help');
}

/* TREVOR : Please please leave for now
function verifyObservationType(inValue: number) {
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="' + inValue + '"]').click();
  cy.get('[data-testid="observationType"]').contains('observationType.' + inValue);
  cy.get('[data-testid="helpPanelId"]').contains('observationType.help');
}
  */

/*****************************************************************************************************/

function verifySuppliedTypeValueAndUnits() {
  cy.get('[data-testid="suppliedType"]').contains('Integration Time');
  cy.get('[data-testid="suppliedType"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="suppliedType"]').contains('Sensitivity');
  cy.get('[data-testid="helpPanelId"]').contains('suppliedType.help');

  cy.get('[data-testid="suppliedValue"]').type('3');
  cy.get('[data-testid="helpPanelId"]').contains('suppliedValue.help');

  cy.get('[data-testid="suppliedUnits"]').contains('Jy/beam');
  cy.get('[data-testid="suppliedUnits"]').click();
  cy.get('[data-value="5"]').click();
  cy.get('[data-testid="suppliedUnits"]').contains('K');
  cy.get('[data-testid="helpPanelId"]').contains('suppliedUnits.help');
}

function verifySuppliedTypeValueAndUnitsLow() {
  cy.get('[data-testid="suppliedType"]').contains('Integration Time');
  cy.get('[data-testid="suppliedType"]')
    .find('input')
    .should('be.disabled');
  cy.get('[data-testid="suppliedValue"]').type('3');
  cy.get('[data-testid="helpPanelId"]').contains('suppliedValue.help');
  cy.get('[data-testid="suppliedUnits"]').contains('h');
  cy.get('[data-testid="suppliedUnits"]')
    .find('input')
    .should('be.disabled');
}

function verifyElevationField() {
  cy.get('[id="elevation"]').clear();
  cy.get('[id="elevation"]').type('15');
  cy.get('[data-testid="helpPanelId"]').contains('elevation.help');
}

function verifyWeatherField() {
  cy.get('[data-testid="weather"]').type('30');
  cy.get('[data-testid="helpPanelId"]').contains('weather.help');
}

function verifyObservationTypeZoom() {
  cy.get('[data-testid="observationType"]').contains('observationType.1');
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="observationType"]').contains('observationType.0');
  cy.get('[data-testid="helpPanelId"]').contains('observationType.help');
}

function verifyObservationTypeZoomUnavailable() {
  cy.get('[data-testid="observationType"]').contains('observationType.1');
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-testid="observationType"]').should('not.contain.value', 'observationType.0');
}

function verifyObservationTypeContinuum() {
  cy.get('[data-testid="observationType"]').contains('observationType.1');
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="1"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('observationType.help');
}

function verifyCentralFrequencyContinuumOb1SubArrayValue20() {
  cy.get('[id="centralFrequency"]').should('have.value', 0.7975);
  cy.get('[id="centralFrequency"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('centralFrequency.help');
}
function verifyCentralFrequencyContinuumOb5aSubArrayValue20() {
  cy.get('[id="centralFrequency"]').should('have.value', 6.55);
  cy.get('[id="centralFrequency"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('centralFrequency.help');
}
function verifyCentralFrequencyContinuumOb5bSubArrayValue20() {
  cy.get('[id="centralFrequency"]').should('have.value', 11.85);
  cy.get('[id="centralFrequency"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('centralFrequency.help');
}
function verifyCentralFrequencyContinuumLowBand() {
  cy.get('[id="centralFrequency"]').should('have.value', 200);
  cy.get('[id="centralFrequency"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('centralFrequency.help');
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
  cy.get('[data-testid="centralFrequency"]').contains('MHz');
}

function verifyBandwidth(value: number, contents: string) {
  cy.get('[data-testid="bandwidth"]').click();
  cy.get('[data-value="' + value + '"]').click();
  cy.get('[data-testid="bandwidth"]').contains(contents);
  cy.get('[data-testid="helpPanelId"]').contains('bandwidth.help');
}

function verifySpectralResolution(contents: string) {
  cy.get('#spectralResolution')
    .should('have.value', contents)
    .should('be.disabled');
}
function verifySpectralResolutionLow() {
  verifySpectralResolution('5.43 kHz (8.1 km/s)');
}
function verifySpectralResolutionLowZoom() {
  verifySpectralResolution('28.3 Hz (42.4 m/s)');
}
function verifySpectralResolutionContinuumOb1SubArrayValue20() {
  verifySpectralResolution('13.44 kHz (5.1 km/s)');
}
function verifySpectralResolutionContinuumOb5aSubArrayValue20() {
  verifySpectralResolution('13.44 kHz (615.1 m/s)');
}
function verifySpectralResolutionContinuumOb5bSubArrayValue20() {
  verifySpectralResolution('13.44 kHz (340.0 m/s)');
}
function verifySpectralResolutionZoomBandMid() {
  verifySpectralResolution('0.21 kHz (48.1 m/s)');
}

function verifySpectralAveragingLow(contents: number) {
  cy.get('#spectralAveraging').should('have.value', contents);
}
function enterSpectralAveragingLow(contents: number) {
  cy.get('#spectralAveraging').click();
  cy.get('#spectralAveraging').clear();
  cy.get('#spectralAveraging').type(contents.toString());
  verifySpectralAveragingLow(contents);
}
function verifySpectralAveragingMid(contents: number) {
  cy.get('#spectralAveraging').contains(contents);
}
function enterSpectralAveragingMid(contents: number) {
  cy.get('#spectralAveraging').click();
  cy.get(`[data-value=${contents}]`).click();
  verifySpectralAveragingMid(contents);
}
function verifyEffectiveResolution(contents: string) {
  cy.get('#effectiveResolution')
    .should('have.value', contents)
    .should('be.disabled');
}
function verifyEffectiveResolutionContinuumOb1SubArrayValue20() {
  verifyEffectiveResolution('13.44 kHz (5.1 km/s)');
}
function verifyEffectiveResolutionContinuumOb5aSubArrayValue20() {
  verifyEffectiveResolution('13.44 kHz (615.1 m/s)');
}
function verifyEffectiveResolutionContinuumOb5bSubArrayValue20() {
  verifyEffectiveResolution('13.44 kHz (340.0 m/s)');
}
function verifyEffectiveResolutionZoomMidBand2() {
  verifyEffectiveResolution('0.2 kHz (48.1 m/s)');
}
function verifyEffectiveResolutionContinuumLowBand() {
  verifyEffectiveResolution('5.43 kHz (8.1 km/s)');
}
function verifyEffectiveResolutionZoomLowBand() {
  verifyEffectiveResolution('28.3 Hz (42.4 m/s)');
}

function verifyTapering(value: number, contents: string) {
  cy.get('[data-testid="tapering"]').click();
  cy.get('[data-value="' + value + '"]').click();
  cy.get('[data-testid="tapering"]').contains(contents);
  cy.get('[data-testid="helpPanelId"]').contains('tapering.help');
}

function verifyImageWeighting() {
  cy.get('[data-testid="imageWeighting"]').contains('imageWeighting.1');
  cy.get('[data-testid="imageWeighting"]').click();
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="imageWeighting"]').contains('imageWeighting.0');
  cy.get('[data-testid="helpPanelId"]').contains('imageWeighting.help');
}

function verifySubBands() {
  cy.get('[id="subBands"]').should('have.value', 1);
  cy.get('[id="subBands"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('subBands.help');
}

function verifyNumOf15mAntennas() {
  //change of band needed to enable antenna field
  verifyObservingBand(1);
  cy.get('[data-testid="subArrayConfiguration"]').click();
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
  verifyObservingBand(0);
  cy.get('[data-testid="subArrayConfiguration"]').click();
  cy.get('[data-value="20"]').click();
  cy.get('[data-testid="numStations"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('numStations.help');
}

// This fails the linting currently. Will look at how to use this as part of the appropriate ticket.
// function verifyGroupObservations() {
//   cy.get('[data-testid="groupObservations"]').contains('groupObservations.none');
//   cy.get('[data-testid="groupObservations"]').click();
//   cy.get('[data-value="-1"]').click();
//   // cy.get('[data-testid="groupObservations"]').contains('groupObservations.new');
//   cy.get('[data-testid="helpPanelId"]').contains('groupObservations.help');
// }

function verifyLowZoomBandwidthSpectralEffectiveResolutionA4() {
  verifySpectralResolution('14.1 Hz (21.2 m/s)');
  verifySpectralAveragingLow(1);
  verifyEffectiveResolution('14.1 Hz (21.2 m/s)');
  verifyBandwidth(3, '97.7 KHz');
  verifySpectralResolution('56.5 Hz (84.7 m/s)');
  verifyEffectiveResolution('56.5 Hz (84.7 m/s)');
  enterSpectralAveragingLow(3);
  verifyEffectiveResolution('169.5 Hz (254.1 m/s)');
  enterSpectralAveragingLow(5);
  verifyEffectiveResolution('282.6 Hz (423.6 m/s)');
  verifyBandwidth(7, '1562.5 KHz');
  verifySpectralResolution('904.2 Hz (1.4 km/s)');
  verifyEffectiveResolution('4521.1 Hz (6.8 km/s)');
}

function verifyMidBand2ZoomBandwidthSpectralEffectiveResolution() {
  verifySpectralResolution('0.21 kHz (46.5 m/s)');
  verifySpectralAveragingMid(1);
  verifyEffectiveResolution('0.2 kHz (46.5 m/s)');
  verifyBandwidth(2, '6.25 MHz');
  verifySpectralResolution('0.42 kHz (92.9 m/s)');
  verifyEffectiveResolution('0.4 kHz (92.9 m/s)');
  enterSpectralAveragingMid(8);
  verifySpectralResolution('0.42 kHz (92.9 m/s)');
  verifyEffectiveResolution('3.4 kHz (743.4 m/s)');
  verifyBandwidth(3, '12.5 MHz');
  verifySpectralResolution('0.84 kHz (185.8 m/s)');
  verifyEffectiveResolution('6.7 kHz (1.5 km/s)');
  enterSpectralAveragingMid(1);
  verifySpectralResolution('0.84 kHz (185.8 m/s)');
  verifyEffectiveResolution('0.8 kHz (185.8 m/s)');
  verifySubArrayConfiguration(5);
  verifySpectralResolution('0.84 kHz (192.2 m/s)');
  verifyEffectiveResolution('0.8 kHz (192.2 m/s)');
}

function verifyMidBand5aZoomBandwidthSpectralEffectiveResolution() {
  verifySpectralResolution('0.21 kHz (9.6 m/s)');
  verifyEffectiveResolution('0.2 kHz (9.6 m/s)');
  verifyBandwidth(2, '6.25 MHz');
  verifySubArrayConfiguration(9);
  verifySpectralResolution('0.42 kHz (19.2 m/s)');
  verifyEffectiveResolution('0.4 kHz (19.2 m/s)');
}

function verifyMidBand5bZoomBandwidthSpectralEffectiveResolution() {
  verifySpectralResolution('0.21 kHz (5.3 m/s)');
  verifyEffectiveResolution('0.2 kHz (5.3 m/s)');
  enterSpectralAveragingMid(24);
  verifySpectralResolution('0.21 kHz (5.3 m/s)');
  verifyEffectiveResolution('5.0 kHz (127.5 m/s)');
  verifyBandwidth(4, '25 MHz');
  verifySpectralResolution('1.68 kHz (42.5 m/s)');
  verifyEffectiveResolution('40.3 kHz (1.0 km/s)');
  enterSpectralAveragingMid(1);
  verifyEffectiveResolution('1.7 kHz (42.5 m/s)');
}

describe('<ObservationEntry />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mount(theTheme);
    });
  }

  /* TREVOR : Please ignore, will update shortly

  for (const theBand of BANDWIDTH_TELESCOPE) {
    for (const subArray of subArrayOptions(BANDWIDTH_TELESCOPE[theBand.value])) {
      for (const type of OBSERVATION_TYPE) {
        it(`${BANDWIDTH_TELESCOPE[theBand.value].label} | ${subArray.label} | ${type}`, () => {
          mount(THEME[1]);
          verifyObservingBand(theBand.value);
          verifySubArrayConfiguration(subArray.value);
          verifyObservationType(type);
        });
      }
    }
  }
    */

  /* 
  it('Verify user input available for observation type Continuum and Array Config MID (Observing Band 1 & SubArrayValue 20)', () => {
    mount(THEME[1]);
    verifyObservingBand(2);
    verifySubArrayConfiguration(2);
    verifyNumOf15mAntennas();
    verifyNumOf13mAntennas();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequencyContinuumOb1SubArrayValue20();
    verifyFrequencyUnits();
    verifyContinuumBandwidthContinuumOb1SubArrayValue20();
    verifySpectralResolutionContinuumOb1SubArrayValue20();
    enterSpectralAveragingMid(1);
    verifyEffectiveResolutionContinuumOb1SubArrayValue20();
    verifyTapering(0, 'tapering.0');
    verifySubBands();
    verifyImageWeighting();
  });
  */

  /*
  it('Verify user input available for observation type Continuum and Array Config MID (Observing Band 5a & SubArrayValue 20)', () => {
    mount(THEME[1]);
    verifyObservingBand(3);
    verifySubArrayConfiguration(20);
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequencyContinuumOb5aSubArrayValue20();
    verifyFrequencyUnits();
    verifyContinuumBandwidthContinuumOb5aSubArrayValue20();
    verifySpectralResolutionContinuumOb5aSubArrayValue20();
    enterSpectralAveragingMid(1);
    verifyEffectiveResolutionContinuumOb5aSubArrayValue20();
    verifyTapering(0, 'tapering.0');
    verifySubBands();
    verifyImageWeighting();
  });
  */

  /*
  it('Verify user input available for observation type Continuum and Array Config MID (Observing Band 5b & SubArrayValue 20)', () => {
    mount(THEME[1]);
    verifyObservingBand(4);
    verifySubArrayConfiguration(20);
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequencyContinuumOb5bSubArrayValue20();
    verifyFrequencyUnits();
    verifyContinuumBandwidthContinuumOb5bSubArrayValue20();
    verifySpectralResolutionContinuumOb5bSubArrayValue20();
    enterSpectralAveragingMid(1);
    verifyEffectiveResolutionContinuumOb5bSubArrayValue20();
    verifyTapering(0, 'tapering.0');
    verifySubBands();
    verifyImageWeighting();
  });
  */

  /*
  it('Verify user input available for observation type Zoom and Array Config MID', () => {
    mount(THEME[1]);
    verifyObservingBand(2);
    verifySubArrayConfiguration(20);
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeZoom();
    verifySuppliedTypeValueAndUnits();
    verifyFrequencyUnits();
    verifySpectralResolutionZoomBandMid();
    enterSpectralAveragingMid(1);
    verifyEffectiveResolutionZoomMidBand2();
    verifyTapering(0, 'tapering.0');
    verifyImageWeighting();
    verifyNumOf15mAntennas();
    verifyNumOf13mAntennas();
  });
  */

  /*
  it('Verify user input available for observation type Zoom and Array Config LOW', () => {
    mount(THEME[1]);
    verifyObservingBand(0);
    verifySubArrayConfiguration(4);
    verifyElevationField();
    verifyObservationTypeZoom();
    verifySuppliedTypeValueAndUnitsLow();
    verifyFrequencyUnitsLow();
    verifyBandwidth(2, '48.8 KHz');
    verifySpectralResolutionLowZoom();
    verifySpectralAveragingLow(1);
    verifyEffectiveResolutionZoomLowBand();
    verifyImageWeighting();
    verifyNumOfStations();
  });
  */

  /*
  it('Verify Array Config LOW and observation type Zoom is not available with certain sub-bands ', () => {
    mount(THEME[1]);
    verifyObservingBand(0);
    verifySubArrayConfiguration(2);
    verifyObservationTypeZoomUnavailable();
  });
  */

  /*
  it('Verify user input available for observation type Continuum and Array Config LOW', () => {
    mount(THEME[1]);
    verifyObservingBand(0);
    verifySubArrayConfiguration(2);
    verifyNumOfStations();
    verifyElevationField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnitsLow();
    verifyCentralFrequencyContinuumLowBand();
    verifyContinuumBandwidthContinuumLowBand();
    verifyFrequencyUnitsLow();
    verifySpectralResolutionLow();
    verifySpectralAveragingLow(1);
    verifyEffectiveResolutionContinuumLowBand();
    verifySubBands();
    verifyImageWeighting();
  });
  */

  /*
  it('Verify central frequency range for observation type Continuum and Array Config LOW', () => {
    mount(THEME[1]);
    verifyObservingBand(0);
    verifySubArrayConfiguration(2);
    verifyCentralFrequencyContinuumLowBand();
  });
  */

  /*
  it('Verify Bandwidth, Spectral resolution, Effective Resolution with Spectral Averaging for observation type Zoom and Array Config AA4 LOW', () => {
    mount(THEME[1]);
    verifyObservingBand(0);
    verifySubArrayConfiguration(4);
    verifyObservationTypeZoom();
    verifyLowZoomBandwidthSpectralEffectiveResolutionA4();
  });

  it('Verify Bandwidth, Spectral resolution, Effective Resolution with Spectral Averaging for observation type Zoom and Array Config Mid Band2', () => {
    mount(THEME[1]);
    verifyObservingBand(2);
    verifySubArrayConfiguration(6);
    verifyObservationTypeZoom();
    verifyMidBand2ZoomBandwidthSpectralEffectiveResolution();
  });

  it('Verify Bandwidth, Spectral resolution, Effective Resolution with Spectral Averaging for observation type Zoom and Array Config Mid Band5A', () => {
    mount(THEME[1]);
    verifyObservingBand(3);
    verifySubArrayConfiguration(6);
    verifyObservationTypeZoom();
    verifyMidBand5aZoomBandwidthSpectralEffectiveResolution();
  });

  it('Verify Bandwidth, Spectral resolution, Effective Resolution with Spectral Averaging for observation type Zoom and Array Config Mid Band5B', () => {
    mount(THEME[1]);
    verifyObservingBand(4);
    verifySubArrayConfiguration(9);
    verifyObservationTypeZoom();
    verifyMidBand5bZoomBandwidthSpectralEffectiveResolution();
  });
  */
});
