import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import ReferenceFrame from './ReferenceFrame';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { LAB_POSITION } from '../../../utils/constants';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const value = 0;

describe('<ReferenceFrame />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
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
