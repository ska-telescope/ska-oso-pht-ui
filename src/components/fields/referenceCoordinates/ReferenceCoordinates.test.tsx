import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import ReferenceCoordinatesField from './ReferenceCoordinates';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../utils/testing/cypress';

const value = 0;

describe('<ReferenceCoordinatesField />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      viewPort();
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <ReferenceCoordinatesField setValue={cy.stub().as('setValue')} value={value} />
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});
