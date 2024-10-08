/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Router } from 'react-router';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../../services/theme/theme';
import SensCalcModalMultiple from './SensCalcModalMultiple';
import { SENSCALC_EMPTY_MOCKED } from '../../../../services/axios/sensitivityCalculator/SensCalcResultsMOCK';
import { THEME, viewPort } from '../../../../utils/testing/cypress';

/*
  
describe('Modal with no data', () => {
  beforeEach(() => {
    viewPort();
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <SensCalcModalMultiple
            open
            onClose={cy.stub().as('handleClose')}
            data={SENSCALC_EMPTY_MOCKED}
            observation={null}
            level={1}
            levelError={null}
          />
        </Router>
      </StoreProvider>
    );
  });
  it('Alert should be displayed when no data', () => {
    cy.get('[data-testid="alertSensCalResultsId"]').should('be.visible');
  });
  it('Empty icon should be displayed when no data', () => {
    cy.get('[aria-label="Status Indicator 5"]').should('be.visible');
  });
});

describe('Modal with data - Continuum', () => {
  beforeEach(() => {
    viewPort();
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <SensCalcModalMultiple
            open
            onClose={cy.stub().as('handleClose')}
            data={SENSCALC_CONTINUUM_MOCKED}
            observation={null}
            level={1}
            levelError={null}
          />
        </Router>
      </StoreProvider>
    );
  });
  it('Alert should not be displayed when data', () => {
    cy.get('[data-testid="alertSensCalResultsId"]').should('not.exist');
  });
  it('Ok icon should be displayed when data', () => {
    cy.get('[aria-label="Status Indicator 0"]').should('be.visible');
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
          <SensCalcModalMultiple
            open
            onClose={cy.stub().as('handleClose')}
            data={SENSCALC_SPECTRAL_MOCKED}
            observation={null}
            level={1}
            levelError={null}
          />
        </Router>
      </StoreProvider>
    );
  });
  it('Alert should not be displayed when data', () => {
    cy.get('[data-testid="alertSensCalResultsId"]').should('not.exist');
  });
  it('Ok icon should be displayed when data', () => {
    cy.get('[aria-label="Status Indicator 0"]').should('be.visible');
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
*/

/*
function verifyHeader(id) {
  cy.get('[data-testid="statusId"]');
  cy.get('.MuiCardHeader-content > .MuiTypography-root').contains(
    'sensitivityCalculatorResults.title (' + id + ')'
  );
  cy.get('[data-testid="baseButtonTestId"]').contains('button.close');
}

function closeButtonClick() {
  cy.get('[data-testid="baseButtonTestId"]').click();
}
*/

function mounting(theTheme: any, observation, data) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <SensCalcModalMultiple
            open
            onClose={cy.stub().as('handleCancel')}
            data={data}
            observation={observation}
            level={1}
            levelError={null}
          />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<SensCalcModalMultiple />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: DEFAULT`, () => {
      mounting(theTheme, null, SENSCALC_EMPTY_MOCKED);
    });
  }
  /* TODO
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: NEW OBSERVATION`, () => {
      mounting(theTheme, NEW_OBSERVATION, SENSCALC_EMPTY_MOCKED);
      verifyHeader(NEW_OBSERVATION.id);
      closeButtonClick();
    });
  }
  */
});
