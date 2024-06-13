import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import SkyDirection1 from './SkyDirection1';

const THEME = [THEME_DARK, THEME_LIGHT];
const value = '';

describe('<TitleContent />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
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
});
