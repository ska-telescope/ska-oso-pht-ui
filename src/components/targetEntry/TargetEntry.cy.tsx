/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../services/theme/theme';
import { RA_TYPE_EQUATORIAL, RA_TYPE_GALACTIC } from '../../utils/constants';
import TargetEntry from './TargetEntry';
import Target from '../../utils/types/target';
import { GetMockProposal } from '../../services/axios/getProposal/getProposal';

const THEME = [THEME_DARK, THEME_LIGHT];

// TODO : setTarget function isn't correct and needs to be corrected
// TODO : Need to validate the Resolve button
// TODO : Should end up with no annotated out code
// TODO : Code coverage to 75% + 

function viewPoint() {
    cy.viewport(1500, 1500);
  }

  function stubbing() {
    cy.stub().as('getProposal').returns(GetMockProposal);
  }

  const initNewTarget = () => {
    const rec:Target = {
      dec: '',
      decUnit: '',
      id: 0,
      name: '',
      latitude: '',
      longitude: '',
      ra: '',
      raUnit: '',
      redshift: '',
      referenceFrame: 0,
      vel: '',
      velType: 0,
      velUnit: ''
    }
    return rec;
  }

function mountAdd(theTheme: any, raType: number) {
    viewPoint();
    stubbing();
    const newTarget = initNewTarget();
    cy.mount(
       <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
            <TargetEntry raType={raType} setTarget={cy.stub().as('setTarget')} target={newTarget}/>
        </Router>        
      </ThemeProvider>
      </StoreProvider>
    );
  }

  function mountEdit(theTheme: any, raType: number) {
    viewPoint();
    stubbing();
    const newTarget = initNewTarget();
    cy.mount(
       <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
            <TargetEntry id={1} raType={raType} setTarget={cy.stub().as('setTarget')} target={newTarget}/>
        </Router>        
      </ThemeProvider>
      </StoreProvider>
    );
  }

  function verifyNameField() {
    cy.get('[data-testid="name"]').type('DUMMY');
    cy.get('[data-testid="helpPanelId"]').contains('name.help');
  }

  function verifySkyDirection1Field() {
    cy.get('[data-testid="skyDirectionValue1"]').type('123.45');
    cy.get('[data-testid="helpPanelId"]').contains('skyDirection.help.1.value');
  }

  function verifySkyDirection2Field() {
    cy.get('[data-testid="skyDirectionValue2"]').type('123.45');
    cy.get('[data-testid="helpPanelId"]').contains('skyDirection.help.2.value');
  }
  
  function velocityTypeField() {
    cy.get('[data-testid="velocityType"]').click();
    cy.get('[data-testid="helpPanelId"]').contains('velocity.help');
    cy.get('[data-value="0"]').click();
    cy.get('[data-testid="velocityType"]').contains('velocity.0');
    cy.get('[data-testid="velocityType"]').click();
    cy.get('[data-value="1"]').click();
    cy.get('[data-testid="velocityType"]').contains('velocity.1');
  }

  function velocityValueField() {
    cy.get('[data-testid="velocityValue"]').type('123.45');
    cy.get('[data-testid="helpPanelId"]').contains('velocity.help');
  }

  function velocityUnitsField() {
    cy.get('[data-testid="velocityUnit"]').click();
    cy.get('[data-testid="helpPanelId"]').contains('velocity.help');
    cy.get('[data-value="0"]').click();
    // cy.get('[data-testid="velocityUnit"]').contains('velocity.units.0');
    // cy.get('[data-testid="velocityType"]').click();
    // cy.get('[data-value="1"]').click();
    // cy.get('[data-testid="velocityUnit"]').contains('velocity.units.1');
  }

  function referenceFrameField() {
    cy.get('[data-testid="referenceFrame"]').click();
    cy.get('[data-testid="helpPanelId"]').contains('referenceFrame.help');
    cy.get('[data-value="0"]').click();
    cy.get('[data-testid="referenceFrame"]').contains('referenceFrame.0');
    // cy.get('[data-testid="referenceFrame"]').click();
    // cy.get('[data-value="1"]').click();
    // cy.get('[data-testid="referenceFrame"]').contains('referenceFrame.1');
  }

describe('<TargetEntry />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
        mountAdd(theTheme, RA_TYPE_EQUATORIAL);
      })
    }
  });

  describe('Content : Add : RA_TYPE_EQUATORIAL', () => {
    beforeEach(() => {
        mountAdd(THEME_LIGHT, RA_TYPE_EQUATORIAL);
    });
    it('Checking content', () => {
        verifyNameField();
        verifySkyDirection1Field();
        verifySkyDirection2Field();
        velocityTypeField();
        velocityValueField();
        velocityUnitsField();
        referenceFrameField();
    });
  });

  describe('Content : Add : RA_TYPE_GALACTIC', () => {
    beforeEach(() => {
        mountAdd(THEME_LIGHT, RA_TYPE_GALACTIC);
    });
    it('Checking content', () => {
        verifyNameField();
        // verifySkyDirection1Field();
        // verifySkyDirection2Field();
        velocityTypeField();
        velocityValueField();
        velocityUnitsField();
        referenceFrameField();
    });
  });

  describe('Content : Edit : RA_TYPE_EQUATORIAL', () => {
    beforeEach(() => {
        mountEdit(THEME_LIGHT, RA_TYPE_EQUATORIAL);
    });
    it('Checking content', () => {
        //verifyNameField();
        // verifySkyDirection1Field();
        // verifySkyDirection2Field();
        // velocityTypeField();
        // velocityValueField();
        // velocityUnitsField();
        // referenceFrameField();
    });
  });

  describe('Content : Edit : RA_TYPE_GALACTIC', () => {
    beforeEach(() => {
        mountEdit(THEME_LIGHT, RA_TYPE_GALACTIC);
    });
    it('Checking content', () => {
        // verifyNameField();
        // verifySkyDirection1Field();
        // verifySkyDirection2Field();
        // velocityTypeField();
        // velocityValueField();
        // velocityUnitsField();
        // referenceFrameField();
    });
  });
});
