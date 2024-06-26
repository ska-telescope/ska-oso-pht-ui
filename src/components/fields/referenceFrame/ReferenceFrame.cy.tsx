import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LABEL_POSITION, THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import ReferenceFrame from './ReferenceFrame';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

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
              <ReferenceFrame
                labelBold={true}
                labelPosition={LABEL_POSITION.START}
                setValue={cy.stub().as('setValue')}
                value={value}
              />
            </ThemeProvider>
          </StoreProvider>
        );
      });
    }
  });
});
