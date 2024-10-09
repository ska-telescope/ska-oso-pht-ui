import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import SkyDirection1 from './SkyDirection1';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const value = '';

describe('<SkyDirection1 />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <SkyDirection1 setValue={cy.stub().as('setValue')} skyUnits={0} value={value} />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});
