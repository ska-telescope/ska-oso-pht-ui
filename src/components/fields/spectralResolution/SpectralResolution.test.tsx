import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import SpectralResolutionField from './SpectralResolution';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { viewPort } from '../../../utils/testing/cypress';

// observingBand : [ Low, Mid 1, Mid 2, Mid 5a, Mid 5b ]
// observationType : [ Zoom, Continuum ]

const TEST_LABEL = 'TEST LABEL';

const DATA = [
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 1,
    frequency: 200,
    frequencyUnits: 1,
    result: '0.2 Hz (0.3 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 2,
    frequency: 200,
    frequencyUnits: 1,
    result: '0.4 Hz (0.6 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 3,
    frequency: 200,
    frequencyUnits: 1,
    result: '0.8 Hz (1.3 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 4,
    frequency: 200,
    frequencyUnits: 1,
    result: '1.7 Hz (2.5 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 5,
    frequency: 200,
    frequencyUnits: 1,
    result: '3.4 Hz (5.0 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 6,
    frequency: 200,
    frequencyUnits: 1,
    result: '6.7 Hz (10.1 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 7,
    frequency: 200,
    frequencyUnits: 1,
    result: '13.4 Hz (20.1 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 8,
    frequency: 200,
    frequencyUnits: 1,
    result: '26.9 Hz (40.3 m/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 1,
    frequency: 200,
    frequencyUnits: 1,
    result: '5.43 kHz (8.1 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 2,
    frequency: 200,
    frequencyUnits: 1,
    result: '5.43 kHz (8.1 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 3,
    frequency: 200,
    frequencyUnits: 1,
    result: '5.43 kHz (8.1 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 4,
    frequency: 200,
    frequencyUnits: 1,
    result: '5.43 kHz (8.1 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 5,
    frequency: 200,
    frequencyUnits: 1,
    result: '5.43 kHz (8.1 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 6,
    frequency: 200,
    frequencyUnits: 1,
    result: '5.43 kHz (8.1 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 7,
    frequency: 200,
    frequencyUnits: 1,
    result: '5.43 kHz (8.1 km/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 1,
    frequency: 200,
    frequencyUnits: 1,
    result: '0.21 kHz (0.3 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 2,
    frequency: 200,
    frequencyUnits: 1,
    result: '0.42 kHz (0.6 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 3,
    frequency: 200,
    frequencyUnits: 1,
    result: '0.84 kHz (1.3 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 4,
    frequency: 200,
    frequencyUnits: 1,
    result: '1.68 kHz (2.5 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 5,
    frequency: 200,
    frequencyUnits: 1,
    result: '3.36 kHz (5.0 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 6,
    frequency: 200,
    frequencyUnits: 1,
    result: '6.72 kHz (10.1 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 7,
    frequency: 200,
    frequencyUnits: 1,
    result: '13.44 kHz (20.1 m/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 1,
    frequency: 200,
    frequencyUnits: 1,
    result: '13.44 kHz (20.1 m/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 2,
    frequency: 200,
    frequencyUnits: 1,
    result: '13.44 kHz (20.1 m/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 3,
    frequency: 200,
    frequencyUnits: 1,
    result: '13.44 kHz (20.1 m/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 4,
    frequency: 200,
    frequencyUnits: 1,
    result: '13.44 kHz (20.1 m/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 5,
    frequency: 200,
    frequencyUnits: 1,
    result: '13.44 kHz (20.1 m/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 6,
    frequency: 200,
    frequencyUnits: 1,
    result: '13.44 kHz (20.1 m/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 7,
    frequency: 200,
    frequencyUnits: 1,
    result: '13.44 kHz (20.1 m/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '0.21 kHz (46.5 m/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 2,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '0.42 kHz (179.9 m/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 3,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '0.84 kHz (359.8 m/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 4,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '1.68 kHz (719.5 m/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 5,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '3.36 kHz (1.4 km/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 6,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '6.72 kHz (2.9 km/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 7,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 1,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 2,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 3,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 4,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 5,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 6,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 7,
    frequency: 0.7,
    frequencyUnits: 1,
    result: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '0.21 kHz (46.5 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 2,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '0.42 kHz (92.9 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 3,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '0.84 kHz (185.8 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 4,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '1.68 kHz (371.7 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 5,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '3.36 kHz (743.4 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 6,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '6.72 kHz (1.5 km/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 7,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 2,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 3,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 4,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 5,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 6,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 7,
    frequency: 1.355,
    frequencyUnits: 1,
    result: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 1,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '0.21 kHz (9.6 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 2,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '0.42 kHz (19.2 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 3,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '0.84 kHz (38.4 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 4,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '1.68 kHz (76.9 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 5,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '3.36 kHz (153.8 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 6,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '6.72 kHz (307.6 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 7,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 1,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 2,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 3,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 4,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 5,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 6,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 7,
    frequency: 6.55,
    frequencyUnits: 1,
    result: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 5,
    observationType: 0,
    bandWidth: 1,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '0.21 kHz (5.3 m/s)'
  },
  {
    observingBand: 5,
    observationType: 0,
    bandWidth: 2,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '0.42 kHz (10.6 m/s)'
  },
  {
    observingBand: 5,
    observationType: 0,
    bandWidth: 3,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '0.84 kHz (21.3 m/s)'
  },
  {
    observingBand: 5,
    observationType: 0,
    bandWidth: 4,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '1.68 kHz (42.5 m/s)'
  },
  {
    observingBand: 5,
    observationType: 0,
    bandWidth: 5,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '3.36 kHz (85.0 m/s)'
  },
  {
    observingBand: 5,
    observationType: 0,
    bandWidth: 6,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '6.72 kHz (170.0 m/s)'
  },
  {
    observingBand: 5,
    observationType: 0,
    bandWidth: 7,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '13.44 kHz (340.0 m/s)'
  },
  {
    observingBand: 5,
    observationType: 1,
    bandWidth: 1,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '13.44 kHz (340.0 m/s)'
  },
  {
    observingBand: 5,
    observationType: 1,
    bandWidth: 2,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '13.44 kHz (340.0 m/s)'
  },
  {
    observingBand: 5,
    observationType: 1,
    bandWidth: 3,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '13.44 kHz (340.0 m/s)'
  },
  {
    observingBand: 5,
    observationType: 1,
    bandWidth: 4,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '13.44 kHz (340.0 m/s)'
  },
  {
    observingBand: 5,
    observationType: 1,
    bandWidth: 5,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '13.44 kHz (340.0 m/s)'
  },
  {
    observingBand: 5,
    observationType: 1,
    bandWidth: 6,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '13.44 kHz (340.0 m/s)'
  },
  {
    observingBand: 5,
    observationType: 1,
    bandWidth: 7,
    frequency: 11.85,
    frequencyUnits: 1,
    result: '13.44 kHz (340.0 m/s)'
  }
];

function mount(
  observingBand: number,
  observationType: number,
  bandWidth: number,
  frequency: number,
  frequencyUnits: number
) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme('light')}>
        <CssBaseline />
        <SpectralResolutionField
          bandWidth={bandWidth}
          frequency={frequency}
          frequencyUnits={frequencyUnits}
          label={TEST_LABEL}
          observingBand={observingBand}
          observationType={observationType}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

describe('<SpectralResolution />', () => {
  for (const rec of DATA) {
    it(`observingBand.${rec.observingBand} | observationType.${rec.observationType} | ${rec.bandWidth} | ${rec.frequency} ${rec.frequencyUnits}`, () => {
      mount(
        rec.observingBand,
        rec.observationType,
        rec.bandWidth,
        rec.frequency,
        rec.frequencyUnits
      );
      // TODO cy.get('#spectralResolution').contains('label', TEST_LABEL);
      cy.get('#spectralResolution').should('have.value', rec.result);
    });
  }
});
