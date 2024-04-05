import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import SkyUnits from './SkyUnits';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const THEME = [THEME_DARK, THEME_LIGHT];
const value = 0;

describe('<TitleContent />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
        cy.mount(
          <StoreProvider>
            <ThemeProvider theme={theme(theTheme)}>
              <CssBaseline />
              <SkyUnits setValue={cy.stub().as('setValue')} value={value} />
            </ThemeProvider>
          </StoreProvider>
        );
      });
    }
  });
});
