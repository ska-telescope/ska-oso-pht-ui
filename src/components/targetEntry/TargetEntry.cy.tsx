/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../services/theme/theme';
import { GetMockProposal } from '../../services/axios/getProposal/getProposal';
import TargetEntry from './TargetEntry';
import Target from '../../utils/types/target';
import { RA_TYPE_EQUATORIAL, RA_TYPE_GALACTIC } from '../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];

// TODO : Replace setTarget stub with a real function, below would be ideal
// const [newTarget, setNewTarget] = React.useState(null);

function initTarget() {
  const newTarget = {
    dec: '',
    decUnit: '',
    id: 0,
    latitude: '',
    longitude: '',
    name: '',
    ra: '',
    raUnit: '',
    redshift: '',
    referenceFrame: 0,
    vel: '',
    velType: 0,
    velUnit: ''
  };
  return newTarget;
}

function viewPort() {
  cy.viewport(1500, 1500);
}

function createStubs() {
  cy.stub()
  .as('getProposal')
  .returns(GetMockProposal);
}

function mountingAdd(theTheme: any, raType:number, newTarget:Target) {
  viewPort()
  createStubs();
  cy.mount(
    <StoreProvider>
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Router location="/" navigator={undefined}>
        <TargetEntry raType={raType} setTarget={cy.stub().as('setTarget')} target={newTarget} />
      </Router>              
    </ThemeProvider>
  </StoreProvider>
  );
}

function mountingEdit(theTheme: any, raType:number, newTarget:Target) {
  viewPort()
  cy.mount(
    <StoreProvider>
    <ThemeProvider theme={theme(theTheme)}>
      <CssBaseline />
      <Router location="/" navigator={undefined}>
        <TargetEntry id={1} raType={raType} setTarget={cy.stub().as('setTarget')} target={newTarget} />
      </Router>              
    </ThemeProvider>
  </StoreProvider>
  );
}

function verifyNameField() {
  cy.get('[data-testid="name"]').type('DUMMY');
  // cy.get('input#imageSize').should('have.value', 'test image size');
  cy.get('[data-testid="helpPanelId"]').contains('name.help');
}

function verifySkyDirection1() {
  cy.get('[data-testid="skyDirectionValue1"]').type('123.45');
  cy.get('[data-testid="helpPanelId"]').contains('skyDirection.help.1.value');
}

function verifySkyDirection2() {
  cy.get('[data-testid="skyDirectionValue2"]').type('123.45');
  cy.get('[data-testid="helpPanelId"]').contains('skyDirection.help.2.value');
}

function verifyVelocityType() {
  cy.get('[data-testid="velocityType"]'); //.click();
  // cy.get('[data-testid="helpPanelId"]').contains('velocity.help');
  // cy.get('[data-value="0"]').click();
  // cy.get('[data-testid="velocityType"]').contains('velocityType.0');
}

function verifyVelocityValue() {
  cy.get('[data-testid="velocityValue"]').type('123.45');
  cy.get('[data-testid="helpPanelId"]').contains('velocity.help');
}

function verifyVelocityUnit() {
  cy.get('[data-testid="velocityUnits"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('velocity.help');
  cy.get('[data-value="0"]').click();
  // cy.get('[data-testid="velocityUnits"]').contains('velocityUnits.0');
}

function verifyReferenceFrame() {
  cy.get('[data-testid="referenceFrame"]').click();
  cy.get('[data-testid="helpPanelId"]').contains('referenceFrame.help');
  cy.get('[data-value="0"]').click();
  cy.get('[data-testid="referenceFrame"]').contains('referenceFrame.0');
  //
  cy.get('[data-testid="referenceFrame"]').click();
  cy.get('[data-value="1"]').click();
  //cy.get('[data-testid="referenceFrame"]').contains('referenceFrame.1');
}

function verifyAddButton() {
  cy.get('[data-testid="addTargetButton"]'); //.click();
}

describe('<TargetEntry />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
        mountingAdd(theTheme, RA_TYPE_EQUATORIAL, initTarget());
      });
    }
  });

  describe('Content. Add, raType = EQUATORIAL', () => {
    beforeEach(() => {
      mountingAdd(THEME_LIGHT, RA_TYPE_EQUATORIAL, initTarget());
    });
    it('Entering basic details', () => {
      verifyNameField();
      verifySkyDirection1();
      verifySkyDirection2();
      verifyVelocityType();
      verifyVelocityValue();
      verifyVelocityUnit();
      verifyReferenceFrame();
      verifyAddButton();
    })
  });

  describe('Content. Add, raType = GALACTIC', () => {
    beforeEach(() => {
      mountingAdd(THEME_LIGHT, RA_TYPE_GALACTIC, initTarget());
    });
    it('Entering basic details', () => {
      verifyNameField();
      // verifySkyDirection1();
      // verifySkyDirection2();
      verifyVelocityType();
      verifyVelocityValue();
      verifyVelocityUnit();
      verifyReferenceFrame();
      verifyAddButton();
    })
  });

  describe('Content. Edit, raType = EQUATORIAL', () => {
    beforeEach(() => {
      mountingEdit(THEME_LIGHT, RA_TYPE_EQUATORIAL, initTarget());
    });
    /*
    it('Entering basic details', () => {
      verifyNameField();
      verifySkyDirection1();
      verifySkyDirection2();
      verifyVelocityType();
      verifyVelocityValue();
      verifyVelocityUnit();
      verifyReferenceFrame();
    })
    */
  });

  describe('Content. Edit, raType = GALACTIC', () => {
    beforeEach(() => {
      mountingEdit(THEME_LIGHT, RA_TYPE_GALACTIC, initTarget());
    });
    /*
    it('Entering basic details', () => {
      verifyNameField();
      // verifySkyDirection1();
      // verifySkyDirection2();
      verifyVelocityType();
      verifyVelocityValue();
      verifyVelocityUnit();
      verifyReferenceFrame();
    })
    */
  });
});
