import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import TargetListSection from './targetListSection';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<TargetNoSpecificSection />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <TargetListSection />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});
