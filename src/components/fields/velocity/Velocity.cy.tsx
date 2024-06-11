import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import theme from '../../../services/theme/theme';
import Velocity from './Velocity';

const THEME = [THEME_DARK, THEME_LIGHT];
const value = '';
const valueType = 0;
const valueUnit = '';

describe('<TitleContent />', () => {
  describe('Theme', () => {
    for (const theTheme of THEME) {
      it(`Theme ${theTheme}: Renders`, () => {
        cy.mount(
          <StoreProvider>
            <ThemeProvider theme={theme(theTheme)}>
              <CssBaseline />
              <Velocity
                setValue={cy.stub().as('setValue')}
                setValueType={cy.stub().as('setValueType')}
                value={value}
                valueType={valueType}
                valueUnit={valueUnit}
              />
            </ThemeProvider>
          </StoreProvider>
        );
      });
    }
  });
});
