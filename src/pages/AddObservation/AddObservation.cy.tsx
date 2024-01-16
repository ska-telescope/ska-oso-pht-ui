/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../services/theme/theme';
import AddObservation from './AddObservation';
import {BrowserRouter} from "react-router-dom";

const THEME = [THEME_DARK, THEME_LIGHT];

function verifyMidArrayAndSubArrayConfig() {
  cy.get('[data-testid="arrayConfiguration"]').contains('MID');
  cy.get('[data-testid="arrayConfiguration"]').click();
  cy.get('[data-value="1"]').click();
  cy.get('[data-testid="helpPanel"]').contains('ARRAY DESCRIPTION');

  cy.get('[data-testid="subarrayConfiguration"]').contains('AA0.5');
  cy.get('[data-testid="subarrayConfiguration"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="subarrayConfiguration"]').contains('AA1');
  cy.get('[data-testid="helpPanel"]').contains('SUBARRAY DESCRIPTION');
}

function verifyLowArrayAndSubArrayConfig() {
  cy.get('[data-testid="arrayConfiguration"]').contains('MID');
  cy.get('[data-testid="arrayConfiguration"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="arrayConfiguration"]').contains('LOW');
  cy.get('[data-testid="helpPanel"]').contains('ARRAY DESCRIPTION');

  cy.get('[data-testid="subarrayConfiguration"]').contains('AA0.5');
  cy.get('[data-testid="subarrayConfiguration"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="subarrayConfiguration"]').contains('AA1');
  cy.get('[data-testid="helpPanel"]').contains('SUBARRAY DESCRIPTION');
}

function verifySuppliedTypeValueAndUnits() {
  cy.get('[data-testid="suppliedType"]').contains('Integration Time');
  cy.get('[data-testid="suppliedType"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="suppliedType"]').contains('Sensitivity');
  cy.get('[data-testid="helpPanel"]').contains('SUPPLIED TYPE DESCRIPTION');

  cy.get('[data-testid="suppliedValue"]').click();
  cy.get('[data-testid="helpPanel"]').contains('SUPPLIED VALUE DESCRIPTION');

  cy.get('[data-testid="suppliedUnits"]').contains('jy/beam');
  cy.get('[data-testid="suppliedUnits"]').click();
  cy.get('[data-value="5"]').click();
  cy.get('[data-testid="suppliedUnits"]').contains('K');
  cy.get('[data-testid="helpPanel"]').contains('SUPPLIED UNITS DESCRIPTION');
}

function verifyElevationField() {
  cy.get('[data-testid="elevation"]').type("test elevation");
  cy.get('[data-testid="helpPanel"]').contains('ELEVATION DESCRIPTION');
}

function verifyWeatherField() {
  cy.get('[data-testid="weather"]').type("test weather");
  cy.get('[data-testid="helpPanel"]').contains('WEATHER DESCRIPTION');
}

function verifyObservationTypeZoom() {
  cy.get('[data-testid="observationType"]').contains('Continuum');
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="observationType"]').contains('Zoom');
  cy.get('[data-testid="helpPanel"]').contains('TYPE DESCRIPTION');
}

function verifyObservationTypeContinuum() {
  cy.get('[data-testid="observationType"]').contains('Continuum');
  cy.get('[data-testid="observationType"]').click();
  cy.get('[data-value="1"]').click();
  cy.get('[data-testid="helpPanel"]').contains('TYPE DESCRIPTION');
}

function verifyCentralFrequency() {
  cy.get('[data-testid="centralFrequency"]').type("test central frequency");
  cy.get('[data-testid="helpPanel"]').contains('FREQUENCY DESCRIPTION');
}

function verifyObservingBand() {
  cy.get('[data-testid="observingBand"]').contains('Band 1 (0.35 - 1.05 GHz)');
  cy.get('[data-testid="observingBand"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="observingBand"]').contains('Band 2 (0.95 - 1.76 GHz)');
  cy.get('[data-testid="helpPanel"]').contains('BAND DESCRIPTION');
}

function verifyFrequencyUnits() {
  cy.get('[data-testid="frequencyUnits"]').contains('GHz');
  cy.get('[data-testid="frequencyUnits"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="frequencyUnits"]').contains('MHz');
  cy.get('[data-testid="helpPanel"]').contains('FREQUENCY UNITS DESCRIPTION');
}

function verifyContinuumBandwidth() {
  cy.get('[data-testid="continuumBandwidth"]').type("test continuum bandwidth frequency");
  cy.get('[data-testid="helpPanel"]').contains('CONTINUUM BANDWIDTH DESCRIPTION');
}

function verifyContinuumUnits() {
  cy.get('[data-testid="continuumUnits"]').contains('GHz');
  cy.get('[data-testid="continuumUnits"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="frequencyUnits"]').contains('MHz');
  cy.get('[data-testid="helpPanel"]').contains('CONTINUUM UNITS DESCRIPTION');
}

function verifyMidBandwidthFrequency() {
  cy.get('[data-testid="bandwidth"]').contains('3.125 MHz');
  cy.get('[data-testid="bandwidth"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="bandwidth"]').contains('6.25 MHz');
  cy.get('[data-testid="helpPanel"]').contains('BANDWIDTH DESCRIPTION');
}

function verifyLowBandwidthFrequency() {
  cy.get('[data-testid="bandwidth"]').contains('24.4 KHz');
  cy.get('[data-testid="bandwidth"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="bandwidth"]').contains('48.8 KHz');
  cy.get('[data-testid="helpPanel"]').contains('BANDWIDTH DESCRIPTION');
}

function verifySpectralResolutionLow() {
  cy.get('[data-testid="spectralResolution"]').contains('14.1 Hz');
  cy.get('[data-testid="spectralResolution"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="spectralResolution"]').contains('28.3 Hz');
  cy.get('[data-testid="helpPanel"]').contains('SPECTRAL RESOLUTION DESCRIPTION');
}

function verifySpectralResolutionMid() {
  cy.get('[data-testid="spectralResolution"]').contains('0.21 KHz');
  cy.get('[data-testid="spectralResolution"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="spectralResolution"]').contains('0.42 KHz');
  cy.get('[data-testid="helpPanel"]').contains('SPECTRAL RESOLUTION DESCRIPTION');
}

function verifySpectralAveraging() {
  cy.get('[data-testid="spectral"]').contains('1');
  cy.get('[data-testid="spectral"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="spectral"]').contains('2');
  cy.get('[data-testid="helpPanel"]').contains('SPECTRAL AVERAGING DESCRIPTION');
}

function verifyEffectiveResolution() {
  cy.get('[data-testid="effective"]').type("test effective resolution");
  cy.get('[data-testid="helpPanel"]').contains('EFFECTIVE RESOLUTION DESCRIPTION');
}

function verifyTapering() {
  cy.get('[data-testid="tapering"]').contains('No tapering');
  cy.get('[data-testid="tapering"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="tapering"]').contains('0.250"');
  cy.get('[data-testid="helpPanel"]').contains('TAPERING DESCRIPTION');
}

function verifyImageWeighting() {
  cy.get('[data-testid="imageWeighting"]').contains('Uniform');
  cy.get('[data-testid="imageWeighting"]').click();
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="imageWeighting"]').contains('Natural');
  cy.get('[data-testid="helpPanel"]').contains('IMAGE DESCRIPTION');
}

function verifySubBands() {
  cy.get('[data-testid="subBands"]').click();
  cy.get('[data-testid="subBands"]').type("2");
  cy.get('[data-testid="helpPanel"]').contains('SUB-BANDS DESCRIPTION');
}

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
  it('Verify user input available for observation type Continuum and Array Config MID', () => {
    cy.mount(
          <BrowserRouter>
            <AddObservation />
          </BrowserRouter>
    );
    verifyMidArrayAndSubArrayConfig();
    verifyObservingBand();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequency();
    verifyFrequencyUnits();
    verifyContinuumBandwidth();
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
    cy.mount(
        <BrowserRouter>
          <AddObservation />
        </BrowserRouter>
    );
    verifyMidArrayAndSubArrayConfig()
    verifyObservingBand();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeZoom();
    verifySuppliedTypeValueAndUnits()
    verifyFrequencyUnits();
    verifyMidBandwidthFrequency();
    verifySpectralResolutionMid();
    verifySpectralAveraging();
    verifyEffectiveResolution();
    verifyTapering();
    verifyImageWeighting();
  });

  it('Verify user input available for observation type Zoom and Array Config LOW', () => {
    cy.mount(
        <BrowserRouter>
          <AddObservation />
        </BrowserRouter>
    );
    verifyLowArrayAndSubArrayConfig();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeZoom();
    verifySuppliedTypeValueAndUnits()
    verifyFrequencyUnits();
    verifyLowBandwidthFrequency();
    verifySpectralResolutionLow();
    verifySpectralAveraging();
    verifyEffectiveResolution();
    verifyTapering();
    verifyImageWeighting();
  });

  it('Verify user input available for observation type Continuum and Array Config LOW', () => {
    cy.mount(
          <BrowserRouter>
            <AddObservation />
          </BrowserRouter>
    );
    verifyLowArrayAndSubArrayConfig();
    verifyElevationField();
    verifyWeatherField();
    verifyObservationTypeContinuum();
    verifySuppliedTypeValueAndUnits();
    verifyCentralFrequency();
    verifyFrequencyUnits();
    verifyContinuumBandwidth();
    verifyContinuumUnits();
    verifyLowBandwidthFrequency();
    verifySpectralResolutionLow();
    verifySpectralAveraging();
    verifyEffectiveResolution();
    verifyTapering();
    verifySubBands();
    verifyImageWeighting();
  });
});
