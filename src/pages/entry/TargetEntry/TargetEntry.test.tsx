/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import TargetEntry from './TargetEntry';
import { RA_TYPE_EQUATORIAL, RA_TYPE_GALACTIC } from '../../../utils/constants';
import Target from '../../../utils/types/target';
import { THEME, viewPort } from '../../../utils/testing/cypress';

// TODO : Replace setTarget stub with a real function, below would be ideal
// const [newTarget, setNewTarget] = React.useState(null);

function initTarget() {
  const newTarget: Target = {
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
    velUnit: 0
  };
  return newTarget;
}

function editTarget() {
  const newTarget: Target = {
    dec: '',
    decUnit: '',
    id: 1,
    latitude: '',
    longitude: '',
    name: 'NAME',
    ra: '',
    raUnit: '',
    redshift: '',
    referenceFrame: 0,
    vel: '',
    velType: 0,
    velUnit: 0
  };
  return newTarget;
}

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
          <TargetEntry
            raType={raType}
            setTarget={cy.stub().as('setTarget')}
            target={initTarget()}
          />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

function mountingEdit(theTheme: any, raType: number) {
  viewPort();

  cy.stub()
    .as('getProposal')
    .returns({
      targets: [
        {
          dec: '',
          decUnit: '',
          id: 1,
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
        }
      ]
    });
  cy.stub().as('setProposal');

  stubResolveButton();

  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <TargetEntry
            id={1}
            raType={raType}
            setTarget={cy.stub().as('setTarget')}
            target={editTarget()}
          />
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

function verifySkyDirection1() {
  cy.get('#skyDirectionValue1').type('123.45');
  verifyHelpPanel('skyDirection.help.1.value');
}

function verifySkyDirection2() {
  cy.get('#skyDirectionValue2').type('123.45');
  verifyHelpPanel('skyDirection.help.2.value');
}

function verifyVelocityType(inValue: number) {
  // TODO cy.get('[data-testid="velocityType"]').click();
  // TODO verifyHelpPanel('velocity.help');
  // TODO cy.get('[data-value=' + inValue + ']').click();
  // TODO cy.get('[data-testid="velocityType"]').contains('velocity.' + {inValue});
}

function verifyVelocityValue() {
  cy.get('[data-testid="velocityValue"]').type('123.45');
  verifyHelpPanel('velocity.help');
}

function verifyVelocityUnit(inValue: number) {
  // TODO cy.get('[data-testid="velocityUnits"]').click();
  // TODO verifyHelpPanel('velocity.help');
  // TODO cy.get('[data-value=' + inValue + ']').click();
  // TODO cy.get('[data-testid="velocityUnits"]').contains('velocity.units.' + inValue);
}

function verifyReferenceFrame(inValue: number) {
  // TODO cy.get('[data-testid="referenceFrame"]').click();
  // TODO verifyHelpPanel('referenceFrame.help');
  // TODO cy.get('[data-value=' + inValue + ']').click();
  // TODO cy.get('[data-testid="referenceFrame"]').contains('referenceFrame.0'); // Need setTarget function to work :  + inValue);
}

function verifyAddButton() {
  cy.get('[data-testid="addTargetButton"]'); //.click();
}

function verifyResolveButton() {
  // TODO cy.get('[data-testid="resolveButton"]').click();
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
      verifySkyDirection1();
      verifySkyDirection2();
      verifyVelocityType(0);
      verifyVelocityType(1);
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
      verifyVelocityType(0);
      verifyVelocityType(1);
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

  describe('Content. Edit, raType = EQUATORIAL', () => {
    beforeEach(() => {
      mountingEdit(THEME[1], RA_TYPE_EQUATORIAL);
    });
    it('Entering basic details', () => {
      /*
        verifyNameField();
        verifySkyDirection1();
        verifySkyDirection2();
        verifyVelocityType(0);
        verifyVelocityValue();
        verifyVelocityUnit(0);
        verifyReferenceFrame(0);
                */
    });
  });

  describe('Content. Edit, raType = GALACTIC', () => {
    beforeEach(() => {
      mountingEdit(THEME[1], RA_TYPE_GALACTIC);
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
