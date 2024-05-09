import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { BrowserRouter } from 'react-router-dom';
import theme from '../../services/theme/theme';
import AddDataProduct from './AddDataProduct';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];

function verifyCancelButton() {
  cy.get('[data-testid="button.cancelButton"]').contains('button.cancel');
}

function verifyPageTitle() {
  // TODO
  // cy.get('#pageTitle').contains('page.13.title');
}

function verifyPageDescription() {
  // TODO
  // cy.get('#pageDesc').contains('page.13.desc');
}

function verifyObsDataProduct() {
  // TODO : Test the label
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

  cy.get('[data-testid="observatoryDataProduct"]').click();
  cy.get('[data-value="3"]').click();
  cy.get('[data-testid="observatoryDataProduct"]').contains(
    'observatoryDataProductConfig.options.3'
  );

  cy.get('[data-testid="observatoryDataProduct"]').click();
  cy.get('[data-value="4"]').click();
  cy.get('[data-testid="observatoryDataProduct"]').contains(
    'observatoryDataProductConfig.options.4'
  );

  cy.get('[data-testid="observatoryDataProduct"]').click();
  cy.get('[data-value="5"]').click();
  cy.get('[data-testid="observatoryDataProduct"]').contains(
    'observatoryDataProductConfig.options.5'
  );
  cy.get('[data-testid="helpPanelId"]').contains('observatoryDataProductConfig.help');
}

function verifyObservationsField() {
  // TODO : We need to have some observations
  // TODO : Test the label
  // cy.get('[data-testid="imageSize"]').type('test image size');
  // cy.get('input#imageSize').should('have.value', 'test image size');
  // cy.get('[data-testid="helpPanelId"]').contains('imageSize.help');
}

function verifyImageSizeField() {
  // TODO : Test the label
  cy.get('[data-testid="imageSize"]').type('test image size');
  cy.get('input#imageSize').should('have.value', 'test image size');
  cy.get('[data-testid="helpPanelId"]').contains('imageSize.help');
}

function verifyPixelSizeField() {
  // TODO : Test the label
  cy.get('[data-testid="pixelSize"]').type('test pixel size');
  cy.get('input#pixelSize').should('have.value', 'test pixel size');
  cy.get('[data-testid="helpPanelId"]').contains('pixelSize.help');
}

function verifyWeightingField() {
  // TODO : Test the label
  cy.get('[data-testid="weighting"]').type('test weighting');
  cy.get('input#weighting').should('have.value', 'test weighting');
  cy.get('[data-testid="helpPanelId"]').contains('weighting.help');
}

function verifyAddButton() {
  cy.get('[data-testid="addButton"]').contains('button.add');
}

describe('<AddDataProduct />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      // TODO : WE NEED TO MOCK A PROPOSAL SO WE CAN GET HOLD OF SOME OBSERVATIONS HERE
      cy.viewport(1500, 1500);

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
      verifyCancelButton();
      verifyPageTitle();
      verifyPageDescription();
      verifyObsDataProduct();
      verifyObservationsField();
      verifyImageSizeField();
      verifyPixelSizeField();
      verifyWeightingField();
      verifyAddButton();
    });
  }
});
