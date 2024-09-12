import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import theme from '../../services/theme/theme';
import AddDataProduct from './AddDataProduct';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../utils/testing/cypress';

/*
function verifyCancelButton() {
  cy.get('[data-testid="button.cancelButton"]').contains('button.cancel');
}

function verifyPageTitle() {
  cy.get('#pageTitle').contains('page.13.title');
}

function verifyPageDescription() {
  cy.get('#pageDesc').contains('page.13.desc');
}

// TODO : Extend these tests further
function verifyObsDataProduct() {
  cy.get('[data-testid="observatoryDataProduct1"]').click();
  cy.get('[data-testid="observatoryDataProduct2"]').click();
  cy.get('[data-testid="observatoryDataProduct3"]').click();
  cy.get('[data-testid="observatoryDataProduct4"]').click();
  cy.get('[data-testid="observatoryDataProduct5"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('observatoryDataProduct.help');
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
*/

describe('<AddDataProduct />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
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
  //verifyCancelButton();
  //verifyPageTitle();
  //verifyPageDescription();
  //verifyObsDataProduct();
  //verifyObservationsField();
  //verifyImageSizeField();
  //verifyPixelSizeField();
  //verifyWeightingField();
  //verifyAddButton();
});
