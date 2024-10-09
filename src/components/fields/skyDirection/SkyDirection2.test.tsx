import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import SkyDirection2 from './SkyDirection2';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const value = '';

describe('<SkyDirection2 />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <SkyDirection2 setValue={cy.stub().as('setValue')} skyUnits={0} value={value} />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});
