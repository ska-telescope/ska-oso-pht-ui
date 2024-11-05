import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import Elevation from './Elevation';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { THEME, viewPort } from '../../../utils/testing/cypress';
import { ELEVATION_DEFAULT } from '../../../utils/constants';

const value = ELEVATION_DEFAULT;

function mountBasic(theTheme: any) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme(theTheme)}>
        <CssBaseline />
        <Elevation
          label="field.label"
          setValue={cy.stub().as('setValue')}
          testId="Elevation"
          value={value}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<Elevation />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}`, () => {
      mountBasic(theTheme);
    });
  }
});
