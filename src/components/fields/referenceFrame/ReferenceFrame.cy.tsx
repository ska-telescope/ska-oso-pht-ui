import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import ReferenceFrame from './ReferenceFrame';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { LAB_POSITION } from '../../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];
const value = 0;

describe('<TitleContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <ReferenceFrame
              labelBold={true}
              labelPosition={LAB_POSITION}
              setValue={cy.stub().as('setValue')}
              value={value}
            />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});
