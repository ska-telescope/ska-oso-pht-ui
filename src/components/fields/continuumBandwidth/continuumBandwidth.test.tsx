import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import ContinuumBandwidthField from './continuumBandwidth';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { viewPort } from '../../../utils/testing/cypress';

const value = 20;

function mountDefault() {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme('light')}>
        <CssBaseline />
        <ContinuumBandwidthField telescope={1} value={value} />
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<ContinuumBandwidthField />', () => {
  it('<ContinuumBandwidth />', () => {
    mountDefault();
  });
});
