/* eslint-disable no-restricted-syntax */

import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { BrowserRouter } from 'react-router-dom';
import theme from '../../services/theme/theme';
import AddDataProduct from './AddDataProduct';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];

function verifyObsDataProduct() {
  cy.get('[data-testid="observatoryDataProduct"]').click();
  cy.get('[data-value="1"]').click();
  cy.get('[data-testid="observatoryDataProduct"]').contains(
    'observatoryDataProductConfig.options.1'
  );

  cy.get('[data-testid="observatoryDataProduct"]').click();
  cy.get('[data-value="2"]').click();
  cy.get('[data-testid="observatoryDataProduct"]').contains(
    'observatoryDataProductConfig.options.2'
  );
  cy.get('[data-testid="helpPanelId"]').contains('observatoryDataProductConfig.help');
}

function verifyPipeline() {
  cy.get('[data-testid="pipeline"]').click();
  cy.get('[data-value="5"]').click();
  cy.get('[data-testid="pipeline"]').contains('pipeline.options.5');

  cy.get('[data-testid="pipeline"]').click();
  cy.get('[data-value="3"]').click();
  cy.get('[data-testid="pipeline"]').contains('pipeline.options.3');
  cy.get('[data-testid="helpPanelId"]').contains('pipeline.help');
}

function verifyImageSizeField() {
  cy.get('[data-testid="imageSize"]').type('test image size');
  cy.get('input#imageSize').should('have.value', 'test image size');
  cy.get('[data-testid="helpPanelId"]').contains('imageSize.help');
}

function verifyPixelSizeField() {
  cy.get('[data-testid="pixelSize"]').type('test pixel size');
  cy.get('input#pixelSize').should('have.value', 'test pixel size');
  cy.get('[data-testid="helpPanelId"]').contains('pixelSize.help');
}

function verifyWeightingField() {
  cy.get('[data-testid="weighting"]').type('test weighting');
  cy.get('input#weighting').should('have.value', 'test weighting');
  cy.get('[data-testid="helpPanelId"]').contains('weighting.help');
}

describe('<AddDataProduct />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <BrowserRouter>
              <AddDataProduct />
            </BrowserRouter>
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }

  it('Verify user input available for Observatory Data Product', () => {
    cy.mount(
      <StoreProvider>
        <BrowserRouter>
          <AddDataProduct />
        </BrowserRouter>
      </StoreProvider>
    );
    verifyObsDataProduct();
  });

  it('Verify user input available for Pipeline', () => {
    cy.mount(
      <StoreProvider>
        <BrowserRouter>
          <AddDataProduct />
        </BrowserRouter>
      </StoreProvider>
    );
    verifyPipeline();
  });

  it('Verify user input available for Image Size', () => {
    cy.mount(
      <StoreProvider>
        <BrowserRouter>
          <AddDataProduct />
        </BrowserRouter>
      </StoreProvider>
    );
    verifyImageSizeField();
  });

  it('Verify user input available for Pixel Size', () => {
    cy.mount(
      <StoreProvider>
        <BrowserRouter>
          <AddDataProduct />
        </BrowserRouter>
      </StoreProvider>
    );
    verifyPixelSizeField();
  });

  it('Verify user input available for Weighting', () => {
    cy.mount(
      <StoreProvider>
        <BrowserRouter>
          <AddDataProduct />
        </BrowserRouter>
      </StoreProvider>
    );
    verifyWeightingField();
  });
});
