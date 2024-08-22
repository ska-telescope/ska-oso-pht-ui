/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AlertColorTypes, THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import StandardAlert from './StandardAlert';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

function mounting(theTheme) {
  cy.viewport(2000, 1000);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <StandardAlert color={AlertColorTypes.Success} testId="testId" text="DUMMY TEXT" />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

function mountingError(theTheme) {
  cy.viewport(2000, 1000);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <StandardAlert color={AlertColorTypes.Error} testId="testId" text="DUMMY TEXT" />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

function mountingWarning(theTheme) {
  cy.viewport(2000, 1000);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <StandardAlert color={AlertColorTypes.Warning} testId="testId" text="DUMMY TEXT" />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

function mountingInfo(theTheme) {
  cy.viewport(2000, 1000);
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Router location="/" navigator={undefined}>
          <StandardAlert color={AlertColorTypes.Info} testId="testId" text="DUMMY TEXT" />
        </Router>
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<StandardAlert /> Success', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});

describe('<StandardAlert /> Error', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mountingError(theTheme);
    });
  }
});

describe('<StandardAlert /> Warning', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mountingWarning(theTheme);
    });
  }
});

describe('<StandardAlert /> Info', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mountingInfo(theTheme);
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    mounting(THEME_LIGHT);
  });
});
