/* eslint-disable no-restricted-syntax */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../services/theme/theme';
import ObservationPage from './ObservationPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../utils/testing/cypress';

const PAGE_NO = 5;

function getProposal(isEmpty: boolean) {
  if (false || isEmpty) {
    cy.stub()
      .as('getProposal')
      .returns({
        prsl_id: 1,
        status: 'draft',
        observations: [],
        targets: [],
        targetObservation: []
      });
  } else {
    cy.stub()
      .as('getProposal')
      .returns({
        prsl_id: 1,
        status: 'draft',
        observations: [
          {
            id: 1
            // telescope: number;
            // subarray: number;
            // linked: string;
            // type: number;
            // observingBand: number;
            // weather?: number; // only for MID
            // elevation: number;
            // centralFrequency: string;
            // bandwidth: number; // only for zoom
            // continuumBandwidth: string; // only for continuum
            // spectralAveraging?: number; // only for LOW
            // tapering?: string; // only for MID
            // imageWeighting: number;
            // integrationTime: number;
            // integrationTimeUnits: number;
            // spectralResolution: string;
            // effectiveResolution: string;
            // numSubBands?: number; // only for MID
            // num15mAntennas?: number;
            // num13mAntennas?: number;
            // numStations?: number;
            // details: string;
          }
        ],
        targets: [
          {
            name: 'M1',
            right_ascension: '22:33:55',
            declination: '22:33:55',
            velocity: '34.6',
            velocity_unit: 'km/s',
            right_ascension_unit: 'degrees',
            declination_unit: 'dd:mm:ss'
          },
          {
            name: 'M2',
            right_ascension: '22:33:55',
            declination: '22:33:55',
            velocity: '34.6',
            velocity_unit: 'km/s',
            right_ascension_unit: 'degrees',
            declination_unit: 'dd:mm:ss'
          }
        ],
        targetObservation: []
      });
  }
}

function updateAppContent2() {
  cy.stub().as('updateAppContent2');
}

function setStubs() {
  updateAppContent2();
}

export function verifyHeader(pageNo: number) {
  // Standard buttons
  cy.get('[data-testId="homeButtonTestId"]').contains('homeBtn.label');
  cy.get('[data-testId="saveButtonTestId"]').contains('saveBtn.label');
  cy.get('[data-testId="validationBtnTestId"]').contains('validationBtn.label');
  cy.get('[data-testId="submitBtnTestId"]').contains('submitBtn.label'); // TODO DISABLED
  // Status Array
  cy.get('[data-testId="statusId1"]');
  cy.get('[data-testId="statusId2"]');
  cy.get('[data-testId="statusId3"]');
  cy.get('[data-testId="statusId4"]');
  cy.get('[data-testId="statusId5"]');
  cy.get('[data-testId="statusId6"]');
  cy.get('[data-testId="statusId7"]');
  cy.get('[data-testId="statusId8"]');
  // Title & Description
  cy.get('#pageTitle').contains('PAGE.' + pageNo + '.TITLE');
  cy.get('#pageDesc').contains('page.' + pageNo + '.desc');
}

export function verifyFooter(pageNo: number) {
  const prevLabel = 'page.' + (pageNo - 1) + '.title';
  const nextLabel = 'page.' + (pageNo + 1) + '.title';
  cy.get('[data-testId="prevButtonTestId"]').contains(prevLabel);
  cy.get('[data-testId="nextButtonTestId"]').contains(nextLabel);
}

function mount(theTheme: any) {
  viewPort();
  setStubs();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <BrowserRouter>
          <ObservationPage />
        </BrowserRouter>
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyAddObservationButton() {
  cy.get('[data-testId="addObservationButton"]').contains('addObservation.button');
}

function verifyDataGridObservations() {
  cy.get('[data-testId="noObservationsNotification"]').contains('error.noObservations');
}

function verifyWrapperTargets() {
  cy.get('[data-testId="noTargetsNotification"]').contains('targets.empty');
}

function verifyDataGridTargets() {
  cy.get('#targetObservationLabel').contains('targetObservation.label');
  cy.get('[data-testId="selectedTickBox"]'); // TODO
  cy.get('[data-testId="notSelectedTickBox"]'); // TODO
}

describe('<ObservationContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      getProposal(false);
      mount(theTheme);
    });
  }
  it(`Renders - empty page`, () => {
    getProposal(false);
    mount(THEME[1]);
    verifyHeader(PAGE_NO);
    verifyFooter(PAGE_NO);
    verifyAddObservationButton();
    verifyDataGridObservations();
    verifyWrapperTargets();
    verifyDataGridTargets();
  });

  it(`Renders - with data`, () => {
    getProposal(true);
    mount(THEME[1]);
    verifyHeader(PAGE_NO);
    verifyFooter(PAGE_NO);
    verifyAddObservationButton();
    verifyDataGridObservations();
    verifyWrapperTargets();
    verifyDataGridTargets();
  });
});

/*
    cy.get('[data-testid="Add observationButton"]').click();
    cy.get('[data-testid="observationDetails"]').should('contain', 'Telescope');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Subarray');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Type');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Actions');

    cy.get('[data-testid="observationDetails"]').should('contain', 'MID');
    cy.get('[data-testid="observationDetails"]').should('contain', 'subarray');
    cy.get('[data-testid="observationDetails"]').should('contain', 'Continuum');

    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Name');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Right Ascension');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Declination');

    cy.get('[data-testid="linkedTargetDetails"]').should('contain', 'Target 3');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', '05:30:00');
    cy.get('[data-testid="linkedTargetDetails"]').should('contain', '-10:00:00');
    */

// TODO: finish to implement test (request not happening)
// describe('GetCalculate good request', () => {
//   beforeEach(() => {
//     const queryString = new URLSearchParams(MockQueryMidCalculate).toString();
//     cy.intercept('GET', `${SKA_SENSITIVITY_CALCULATOR_API_URL}mid/calculate?${queryString}`, {
//       fixture: 'getMidCalculateResponse.json'
//     }).as('getCalculate');
//     cy.mount(
//       <StoreProvider>
//         <Router location="/" navigator={undefined}>
//           <ObservationPage />
//         </Router>
//       </StoreProvider>
//     );
//   });
//   it('displays "Success"', () => {
//     cy.wait('@getCalculate');
//     cy.get('[data-testid="alertSensCalErrorId"]')
//       .should('be.visible')
//       .should('have.text', 'Success');
//   });
// });
