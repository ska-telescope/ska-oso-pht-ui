/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import TimedAlert from './TimedAlert';

const THEME = [THEME_DARK, THEME_LIGHT];
const DELAY = 5;

function viewPort() {
  cy.viewport(1500, 1000);
}

function mountingDefault(theTheme: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <TimedAlert color={AlertColorTypes.Success} testId="testId" text="DUMMY TEXT" />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

function mountingDelay(theTheme: any, delay) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <TimedAlert
            color={AlertColorTypes.Success}
            delay={delay}
            testId="testId"
            text="DUMMY TEXT"
          />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

function verifyContents() {
  cy.get('#standardAlertId').contains('DUMMY TEXT');
}

describe('<AlertDialog />', () => {
  for (const theTheme of THEME) {
    it(`Theme: ${theTheme} | Delay : DEFAULT`, () => {
      mountingDefault(theTheme);
      verifyContents();
    });

    it(`Theme: ${theTheme} | Delay : ${DELAY}`, () => {
      mountingDelay(theTheme, DELAY);
      verifyContents();
    });
  }
});
