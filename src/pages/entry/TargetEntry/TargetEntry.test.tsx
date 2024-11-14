import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import TargetEntry from './TargetEntry';
import { RA_TYPE_EQUATORIAL, RA_TYPE_GALACTIC } from '../../../utils/constants';
import { THEME, viewPort } from '../../../utils/testing/cypress';

function stubResolveButton() {
  cy.stub().as('getCoordinates');
}

function mountingAdd(theTheme: any, raType: number) {
  viewPort();
  stubResolveButton();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <TargetEntry raType={raType} />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyHelpPanel(inValue) {
  cy.get('[data-testid="helpPanelId"]').contains(inValue);
}

function verifyNameField() {
  cy.get('#name').type('DUMMY');
  verifyHelpPanel('name.help');
}

// function verifySkyDirection1() {
//   cy.get('#skyDirectionValue1').type('123.45');
//   verifyHelpPanel('skyDirection.help.1.value');
// }

// function verifySkyDirection2() {
//   cy.get('[data-testid="skyDirectionValue2"]').type('123.45');
//   verifyHelpPanel('skyDirection.help.2.value');
// }

function verifyVelocityType(inValue: number) {
  cy.get('[data-testid="velocityType"]').click();
  cy.get('[data-value=' + inValue + ']').click();
  cy.get('[data-testid="velocityType"]').contains('velocity.' + inValue);
  // verifyHelpPanel('velocity.help');
}

function verifyVelocityValue() {
  // cy.get('[data-testid="velocityValue"]').type('123.45');
  // verifyHelpPanel('velocity.help');
}

function verifyVelocityUnit(inValue: number) {
  cy.get('[data-testid="velocityUnits"]').click();
  cy.get('[data-value=' + inValue + ']').click();
  cy.get('[data-testid="velocityUnits"]').contains('velocity.units.' + inValue);
  // verifyHelpPanel('velocity.help');
}

function verifyReferenceFrame(inValue: number) {
  cy.get('[data-testid="referenceFrame"]').click();
  verifyHelpPanel('referenceFrame.help');
  cy.get('[data-value=' + inValue + ']').click();
  cy.get('[data-testid="referenceFrame"]').contains('referenceFrame.' + inValue);
}

function verifyAddButton() {
  cy.get('[data-testid="addTargetButton"]'); //.click();
}

function verifyResolveButton() {
  cy.get('[data-testid="resolveButton"]'); //.click();
  // Check that content is updated
}

describe('<TargetEntry />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
        mountingAdd(theTheme, RA_TYPE_EQUATORIAL);
      });
    }
  });

  describe('Content. Add, raType = EQUATORIAL', () => {
    beforeEach(() => {
      mountingAdd(THEME[1], RA_TYPE_EQUATORIAL);
    });
    it('Entering basic details', () => {
      verifyNameField();
      // verifySkyDirection1();
      // verifySkyDirection2();
      verifyVelocityType(1);
      verifyVelocityType(0);
      verifyVelocityValue();
      verifyVelocityUnit(0);
      verifyVelocityUnit(1);
      verifyReferenceFrame(0);
      verifyReferenceFrame(1);
      verifyAddButton();
    });

    it('Using resolve button', () => {
      verifyResolveButton();
      verifyAddButton();
    });
  });

  describe('Content. Add, raType = GALACTIC', () => {
    beforeEach(() => {
      mountingAdd(THEME[1], RA_TYPE_GALACTIC);
    });
    it('Entering basic details', () => {
      verifyNameField();
      // verifySkyDirection1();
      // verifySkyDirection2();
      verifyVelocityType(1);
      verifyVelocityType(0);
      verifyVelocityValue();
      verifyVelocityUnit(0);
      verifyVelocityUnit(1);
      verifyReferenceFrame(0);
      verifyReferenceFrame(1);
      verifyAddButton();
    });
    it('Using resolve button', () => {
      verifyResolveButton();
      verifyAddButton();
    });
  });
});
