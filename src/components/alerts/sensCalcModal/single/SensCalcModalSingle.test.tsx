/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Router } from 'react-router-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../../services/theme/theme';
import SensCalcModalSingle from './SensCalcModalSingle';
import {
  SENSCALC_EMPTY_MOCKED,
  SENSCALC_CONTINUUM_MOCKED,
  SENSCALC_SPECTRAL_MOCKED
} from '../../../../services/axios/sensitivityCalculator/SensCalcResultsMOCK';
import { THEME, viewPort } from '../../../../utils/testing/cypress';

describe('<SensCalcModalSingle />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <SensCalcModalSingle
              open
              onClose={cy.stub().as('handleCancel')}
              data={SENSCALC_EMPTY_MOCKED}
            />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});

describe('Modal with no data', () => {
  beforeEach(() => {
    viewPort();
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <SensCalcModalSingle
            open
            onClose={cy.stub().as('handleClose')}
            data={SENSCALC_EMPTY_MOCKED}
          />
        </Router>
      </StoreProvider>
    );
  });
  it('Alert should be displayed when no data', () => {
    cy.get('[data-testid="alertSensCalResultsId"]').should('be.visible');
  });
  it('Empty icon should be displayed when no data', () => {
    cy.get('[aria-label="sensitivityCalculatorResults.status"]').should('be.visible');
  });
});

describe('Modal with data - Continuum', () => {
  beforeEach(() => {
    viewPort();
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <SensCalcModalSingle
            open
            onClose={cy.stub().as('handleClose')}
            data={SENSCALC_CONTINUUM_MOCKED}
          />
        </Router>
      </StoreProvider>
    );
  });
  it('Alert should not be displayed when data', () => {
    cy.get('[data-testid="alertSensCalResultsId"]').should('not.exist');
  });
  it('Ok icon should be displayed when data', () => {
    cy.get('[aria-label="sensitivityCalculatorResults.status"]').should('be.visible');
  });
  it('Alert should display appropriate results (continuum)', () => {
    cy.get('[id="continuumSensitivityWeighted"]').should(
      'contain',
      'sensitivityCalculatorResults.continuumSensitivityWeighted'
    );
    cy.get('[id="continuumConfusionNoise"]').should(
      'contain',
      'sensitivityCalculatorResults.continuumConfusionNoise'
    );
    cy.get('[id="continuumTotalSensitivity"]').should(
      'contain',
      'sensitivityCalculatorResults.continuumTotalSensitivity'
    );
    cy.get('[id="continuumSynthBeamSize"]').should(
      'contain',
      'sensitivityCalculatorResults.continuumSynthBeamSize'
    );
    cy.get('[id="continuumSurfaceBrightnessSensitivity"]').should(
      'contain',
      'sensitivityCalculatorResults.continuumSurfaceBrightnessSensitivity'
    );
    cy.get('[id="spectralSensitivityWeighted"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralSensitivityWeighted'
    );
    cy.get('[id="spectralConfusionNoise"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralConfusionNoise'
    );
    cy.get('[id="spectralTotalSensitivity"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralTotalSensitivity'
    );
    cy.get('[id="spectralSynthBeamSize"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralSynthBeamSize'
    );
    cy.get('[id="spectralSurfaceBrightnessSensitivity"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralSurfaceBrightnessSensitivity'
    );
    cy.get('[id="integrationTime"]').should(
      'contain',
      'sensitivityCalculatorResults.integrationTime'
    );
  });
});

describe('Modal with data - Spectral', () => {
  beforeEach(() => {
    viewPort();
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <SensCalcModalSingle
            open
            onClose={cy.stub().as('handleClose')}
            data={SENSCALC_SPECTRAL_MOCKED}
          />
        </Router>
      </StoreProvider>
    );
  });
  it('Alert should not be displayed when data', () => {
    cy.get('[data-testid="alertSensCalResultsId"]').should('not.exist');
  });
  it('Ok icon should be displayed when data', () => {
    cy.get('[aria-label="sensitivityCalculatorResults.status"]').should('be.visible');
  });
  it('Alert should display appropriate results (spectral)', () => {
    cy.get('[id="spectralSensitivityWeighted"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralSensitivityWeighted'
    );
    cy.get('[id="spectralConfusionNoise"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralConfusionNoise'
    );
    cy.get('[id="spectralTotalSensitivity"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralTotalSensitivity'
    );
    cy.get('[id="spectralSynthBeamSize"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralSynthBeamSize'
    );
    cy.get('[id="spectralSurfaceBrightnessSensitivity"]').should(
      'contain',
      'sensitivityCalculatorResults.spectralSurfaceBrightnessSensitivity'
    );
    cy.get('[id="integrationTime"]').should(
      'contain',
      'sensitivityCalculatorResults.integrationTime'
    );
  });
});
