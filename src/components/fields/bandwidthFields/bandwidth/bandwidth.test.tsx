import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../../services/theme/theme';
import BandwidthField from './bandwidth';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { viewPort } from '../../../../utils/testing/cypress';

const value = 1;

function mountDefault() {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme('light')}>
        <CssBaseline />
        <BandwidthField
          telescope={1}
          testId="bandwidth"
          value={value}
          observingBand={0}
          centralFrequency={200}
          centralFrequencyUnits={1}
          subarrayConfig={8}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<BandwidthField />', () => {
  it('<Bandwidth />', () => {
    mountDefault();
  });
});
