/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import MemberSearch from './MemberSearch';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<MemberSearch />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <MemberSearch />
        </ThemeProvider>
      );
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    cy.mount(
      <ThemeProvider theme={theme(THEME_LIGHT)}>
        <CssBaseline />
        <MemberSearch />
      </ThemeProvider>
    );
  });
});
