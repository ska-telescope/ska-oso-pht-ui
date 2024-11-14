/* eslint-disable no-restricted-syntax */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../services/theme/theme';
import SdpDataPage from './SdpDataPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../utils/testing/cypress';

const PAGE_NO = 7;

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
          <SdpDataPage />
        </BrowserRouter>
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyAddDataProductButton(isDisabled: boolean) {
  if (isDisabled) {
    cy.get('[data-testId="addDataProductButton"]')
      .contains('dataProduct.button')
      .should('be.disabled');
    // } else {
    //   cy.get('[data-testId="addDataProductButton"]').contains('dataProduct.button').should('not.be.disabled');
  }
}

function verifyDataGridDataProducts(isEmpty: boolean) {
  if (isEmpty) {
    cy.get('[data-testId="helpPanelId"]');
  }
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
    verifyAddDataProductButton(true);
    verifyDataGridDataProducts(false);
  });

  it(`Renders - with data`, () => {
    getProposal(true);
    mount(THEME[1]);
    verifyHeader(PAGE_NO);
    verifyFooter(PAGE_NO);
    verifyAddDataProductButton(false);
    verifyDataGridDataProducts(true);
  });
});

//  THINGS TO BE TESTED
//
//  NO OBVERSATIONS
//       ADD BUTTON : DISABLED
//       ERROR PANEL : CONTAINING MESSAGE STATING THAT THERE ARE NO OBSERVATIONS
//       DATAGRID : NOT PRESSENT
//
//  NEED TO ADD AN OBVERSATION AT THIS POINT
//
//  OBVERSATIONS, NO DATA PRODUCTS
//       ADD BUTTON : ENABLED
//       ERROR PANEL : CONTAINING MESSAGE STATING THAT THERE ARE NO DATA PRODUCTS
//       DATAGRID : NOT PRESSENT
//
//  NEED TO ADD AN DATA PRODUCT AT THIS POINT
//
//  IF OBVERSATIONS, DATA PRODUCTS
//       ADD BUTTON : ENABLED
//       ERROR PANEL : NOT PRESENT
//       DATAGRID : PRESENT
//
//  TEST THE REMOVAL OF A DATA PRODUCT AT THIS POINT
