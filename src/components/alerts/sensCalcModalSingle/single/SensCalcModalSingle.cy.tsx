/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { Router } from 'react-router-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../../services/theme/theme';
import SensCalcDisplaySingle from './SensCalcModalSingle';
import {
  SENSCALC_EMPTY,
  SENSCALC_MOCKED
} from '../../../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';

const THEME = [THEME_DARK, THEME_LIGHT];

// LOW API response
/*
const response = {
  calculate: {
    sensitivity: 5.4349377028499,
    units: 'uJy/beam'
  },
  weighting: {
    weighting_factor: 15.176737500353465,
    sbs_conv_factor: [2598892.1330005163],
    confusion_noise: {
      value: [0.00000103538377754085],
      limit_type: ['value']
    },
    beam_size: [
      {
        beam_maj_scaled: 0.0010792161880542248,
        beam_min_scaled: 0.0008405281736775013,
        beam_pa: 190.60129457149282
      }
    ]
  },
  weightingLine: {
    weighting_factor: 12.696037725198487,
    sbs_conv_factor: [1035304.4396926606],
    confusion_noise: {
      value: [0.000003549738945339684],
      limit_type: ['value']
    },
    beam_size: [
      {
        beam_maj_scaled: 0.0016339516370391025,
        beam_min_scaled: 0.0013936114519620306,
        beam_pa: 17.878165434661216
      }
    ]
  }
};
const lvlError = 1;
const lvlOk = 0;
const observation = { telescope: 2 };
*/

describe('<ObservationTargetResultsDisplay />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.viewport(1500, 1500);
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <SensCalcDisplaySingle
              open
              onClose={cy.stub().as('handleCancel')}
              data={SENSCALC_EMPTY}
            />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});

describe('Modal with no data', () => {
  beforeEach(() => {
    cy.viewport(1500, 1500);
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <SensCalcDisplaySingle open onClose={cy.stub().as('handleClose')} data={SENSCALC_EMPTY} />
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

describe('Modal with data', () => {
  beforeEach(() => {
    cy.viewport(1500, 1500);
    cy.mount(
      <StoreProvider>
        <Router location="/" navigator={undefined}>
          <SensCalcDisplaySingle
            open
            onClose={cy.stub().as('handleClose')}
            data={SENSCALC_MOCKED}
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
  it('Alert should display appropriate results', () => {
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
    cy.get('[id="pwhmOfrmsf"]').should('contain', 'sensitivityCalculatorResults.pwhmOfrmsf');
    cy.get('[id="maxFaradayDepthExtent"]').should(
      'contain',
      'sensitivityCalculatorResults.maxFaradayDepthExtent'
    );
    cy.get('[id="maxFaradayDepth"]').should('contain', 'sensitivityCalculatorResults.maxFaradayDepth');
  });
});
