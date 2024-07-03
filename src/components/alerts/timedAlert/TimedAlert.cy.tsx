/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AlertColorTypes, THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import TimedAlert from './TimedAlert';
import { Router } from 'react-router-dom';

const THEME = [THEME_DARK, THEME_LIGHT];

function mounting(theTheme) {
  cy.viewport(1500, 1500);
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

describe('<TimedAlert />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      mounting(theTheme);
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    mounting(THEME_LIGHT);
  });
});
