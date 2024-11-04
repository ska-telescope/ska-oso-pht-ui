import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../../../services/theme/theme';
import EffectiveResolutionField from './EffectiveResolution';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { viewPort } from '../../../utils/testing/cypress';
import { TYPE_ZOOM } from '../../../utils/constants';

const TEST_LABEL = 'TEST LABEL';

// TODO : Extract and re-use with EffectiveResolution testing

const DATA = [
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 1,
    bandWidthUnits: 2,
    frequency: 200,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '14.13 Hz (21.2 m/s)',
    effectiveResolution: '14.13 Hz (21.2 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 2,
    bandWidthUnits: 2,
    frequency: 200,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '28.26 Hz (42.4 m/s)',
    effectiveResolution: '28.26 Hz (42.4 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 3,
    bandWidthUnits: 2,
    frequency: 200,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '56.51 Hz (84.7 m/s)',
    effectiveResolution: '56.51 Hz (84.7 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 4,
    bandWidthUnits: 2,
    frequency: 200,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '113.03 Hz (169.4 m/s)',
    effectiveResolution: '113.03 Hz (169.4 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 5,
    bandWidthUnits: 2,
    frequency: 200,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '226.06 Hz (338.9 m/s)',
    effectiveResolution: '226.06 Hz (338.9 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 6,
    bandWidthUnits: 2,
    frequency: 200,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '452.11 Hz (677.7 m/s)',
    effectiveResolution: '452.11 Hz (677.7 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 7,
    bandWidthUnits: 2,
    frequency: 200,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '452.11 Hz (677.7 m/s)',
    effectiveResolution: '452.11 Hz (677.7 m/s)'
  },
  {
    observingBand: 0,
    observationType: 0,
    bandWidth: 8,
    bandWidthUnits: 2,
    frequency: 200,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '1808.45 Hz (2.7 km/s)',
    effectiveResolution: '1808.45 Hz (2.7 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 1,
    bandWidthUnits: 2,
    frequency: 1,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '5.43 kHz (1627.9 km/s)',
    effectiveResolution: '5.43 kHz (1627.9 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 2,
    bandWidthUnits: 2,
    frequency: 50,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '5.43 kHz (32.6 km/s)',
    effectiveResolution: '5.43 kHz (32.6 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 3,
    bandWidthUnits: 2,
    frequency: 100,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '5.43 kHz (16.3 km/s)',
    effectiveResolution: '5.43 kHz (16.3 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 4,
    bandWidthUnits: 2,
    frequency: 200,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '5.43 kHz (8.1 km/s)',
    effectiveResolution: '5.43 kHz (8.1 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 5,
    bandWidthUnits: 2,
    frequency: 250,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '5.43 kHz (6.5 km/s)',
    effectiveResolution: '5.43 kHz (6.5 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 6,
    bandWidthUnits: 2,
    frequency: 300,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '5.43 kHz (5.4 km/s)',
    effectiveResolution: '5.43 kHz (5.4 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 7,
    bandWidthUnits: 2,
    frequency: 501,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '5.43 kHz (3.2 km/s)',
    effectiveResolution: '5.43 kHz (3.2 km/s)'
  },
  {
    observingBand: 0,
    observationType: 1,
    bandWidth: 8,
    bandWidthUnits: 2,
    frequency: 800,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '5.43 kHz (2.0 km/s)',
    effectiveResolution: '5.43 kHz (2.0 km/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 1,
    bandWidthUnits: 2,
    frequency: 0.7975,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.21 kHz (78.9 m/s)',
    effectiveResolution: '0.21 kHz (78.9 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 2,
    bandWidthUnits: 2,
    frequency: 0.7975,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.42 kHz (157.9 m/s)',
    effectiveResolution: '0.42 kHz (157.9 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 3,
    bandWidthUnits: 2,
    frequency: 0.7975,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.84 kHz (315.8 m/s)',
    effectiveResolution: '0.84 kHz (315.8 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 4,
    bandWidthUnits: 2,
    frequency: 0.7975,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '1.68 kHz (631.5 m/s)',
    effectiveResolution: '1.68 kHz (631.5 m/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 5,
    bandWidthUnits: 2,
    frequency: 0.7975,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '3.36 kHz (1.3 km/s)',
    effectiveResolution: '3.36 kHz (1.3 km/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 6,
    bandWidthUnits: 2,
    frequency: 0.7975,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '6.72 kHz (2.5 km/s)',
    effectiveResolution: '6.72 kHz (2.5 km/s)'
  },
  {
    observingBand: 1,
    observationType: 0,
    bandWidth: 7,
    bandWidthUnits: 2,
    frequency: 0.7975,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (5.1 km/s)',
    effectiveResolution: '13.44 kHz (5.1 km/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 0.35,
    bandWidthUnits: 1,
    frequency: 0.435,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (11.5 km/s)',
    effectiveResolution: '13.44 kHz (9.3 km/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 0.45,
    bandWidthUnits: 1,
    frequency: 0.435,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (9.0 km/s)',
    effectiveResolution: '13.44 kHz (9.3 km/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 0.6,
    bandWidthUnits: 1,
    frequency: 0.435,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (6.7 km/s)',
    effectiveResolution: '13.44 kHz (9.3 km/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 0.9,
    bandWidthUnits: 1,
    frequency: 0.7975,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (4.5 km/s)',
    effectiveResolution: '13.44 kHz (5.1 km/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 0.85,
    bandWidthUnits: 1,
    frequency: 0.1,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (4.7 km/s)',
    effectiveResolution: '13.44 kHz (40.3 km/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 0.85,
    bandWidthUnits: 1,
    frequency: 0.1,
    frequencyUnits: 2,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (4.7 km/s)',
    effectiveResolution: '13.44 kHz (40292.1 km/s)'
  },
  {
    observingBand: 1,
    observationType: 1,
    bandWidth: 0.435,
    bandWidthUnits: 1,
    frequency: 0.7975,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (9.3 km/s)',
    effectiveResolution: '13.44 kHz (5.1 km/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 1,
    bandWidthUnits: 2,
    frequency: 1.31,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.21 kHz (48.1 m/s)',
    effectiveResolution: '0.21 kHz (48.1 m/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 2,
    bandWidthUnits: 2,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.42 kHz (179.9 m/s)',
    effectiveResolution: '0.42 kHz (179.9 m/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 3,
    bandWidthUnits: 2,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.84 kHz (359.8 m/s)',
    effectiveResolution: '0.84 kHz (359.8 m/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 4,
    bandWidthUnits: 2,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '1.68 kHz (719.5 m/s)',
    effectiveResolution: '1.68 kHz (719.5 m/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 5,
    bandWidthUnits: 2,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '3.36 kHz (1.4 km/s)',
    effectiveResolution: '3.36 kHz (1.4 km/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 6,
    bandWidthUnits: 2,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '6.72 kHz (2.9 km/s)',
    effectiveResolution: '6.72 kHz (2.9 km/s)'
  },
  {
    observingBand: 2,
    observationType: 0,
    bandWidth: 7,
    bandWidthUnits: 2,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (5.8 km/s)',
    effectiveResolution: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 1,
    bandWidthUnits: 1,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (4.0 km/s)',
    effectiveResolution: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 2,
    bandWidthUnits: 1,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (2.0 km/s)',
    effectiveResolution: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 3,
    bandWidthUnits: 1,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (1.3 km/s)',
    effectiveResolution: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 4,
    bandWidthUnits: 1,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (1.0 km/s)',
    effectiveResolution: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 5,
    bandWidthUnits: 1,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (805.8 m/s)',
    effectiveResolution: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 6,
    bandWidthUnits: 1,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (671.5 m/s)',
    effectiveResolution: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 2,
    observationType: 1,
    bandWidth: 7,
    bandWidthUnits: 1,
    frequency: 0.7,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (575.6 m/s)',
    effectiveResolution: '13.44 kHz (5.8 km/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 1,
    bandWidthUnits: 2,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.21 kHz (46.5 m/s)',
    effectiveResolution: '0.21 kHz (46.5 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 2,
    bandWidthUnits: 2,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.42 kHz (92.9 m/s)',
    effectiveResolution: '0.42 kHz (92.9 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 3,
    bandWidthUnits: 2,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.84 kHz (185.8 m/s)',
    effectiveResolution: '0.84 kHz (185.8 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 4,
    bandWidthUnits: 2,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '1.68 kHz (371.7 m/s)',
    effectiveResolution: '1.68 kHz (371.7 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 5,
    bandWidthUnits: 2,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '3.36 kHz (743.4 m/s)',
    effectiveResolution: '3.36 kHz (743.4 m/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 6,
    bandWidthUnits: 2,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '6.72 kHz (1.5 km/s)',
    effectiveResolution: '6.72 kHz (1.5 km/s)'
  },
  {
    observingBand: 3,
    observationType: 0,
    bandWidth: 7,
    bandWidthUnits: 2,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (3.0 km/s)',
    effectiveResolution: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 1,
    bandWidthUnits: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (4.0 km/s)',
    effectiveResolution: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 2,
    bandWidthUnits: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (2.0 km/s)',
    effectiveResolution: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 3,
    bandWidthUnits: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (1.3 km/s)',
    effectiveResolution: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 4,
    bandWidthUnits: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (1.0 km/s)',
    effectiveResolution: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 5,
    bandWidthUnits: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (805.8 m/s)',
    effectiveResolution: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 6,
    bandWidthUnits: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (671.5 m/s)',
    effectiveResolution: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 3,
    observationType: 1,
    bandWidth: 7,
    bandWidthUnits: 1,
    frequency: 1.355,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (575.6 m/s)',
    effectiveResolution: '13.44 kHz (3.0 km/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 1,
    bandWidthUnits: 2,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.21 kHz (9.6 m/s)',
    effectiveResolution: '0.21 kHz (9.6 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 2,
    bandWidthUnits: 2,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.42 kHz (19.2 m/s)',
    effectiveResolution: '0.42 kHz (19.2 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 3,
    bandWidthUnits: 2,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '0.84 kHz (38.4 m/s)',
    effectiveResolution: '0.84 kHz (38.4 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 4,
    bandWidthUnits: 2,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '1.68 kHz (76.9 m/s)',
    effectiveResolution: '1.68 kHz (76.9 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 5,
    bandWidthUnits: 2,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '3.36 kHz (153.8 m/s)',
    effectiveResolution: '3.36 kHz (153.8 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 6,
    bandWidthUnits: 2,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '6.72 kHz (307.6 m/s)',
    effectiveResolution: '6.72 kHz (307.6 m/s)'
  },
  {
    observingBand: 4,
    observationType: 0,
    bandWidth: 7,
    bandWidthUnits: 2,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (615.1 m/s)',
    effectiveResolution: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 1,
    bandWidthUnits: 1,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (4.0 km/s)',
    effectiveResolution: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 2,
    bandWidthUnits: 1,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (2.0 km/s)',
    effectiveResolution: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 3,
    bandWidthUnits: 1,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (1.3 km/s)',
    effectiveResolution: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 4,
    bandWidthUnits: 1,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (1.0 km/s)',
    effectiveResolution: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 5,
    bandWidthUnits: 1,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (805.8 m/s)',
    effectiveResolution: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 6,
    bandWidthUnits: 1,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (671.5 m/s)',
    effectiveResolution: '13.44 kHz (615.1 m/s)'
  },
  {
    observingBand: 4,
    observationType: 1,
    bandWidth: 7,
    bandWidthUnits: 1,
    frequency: 6.55,
    frequencyUnits: 1,
    spectralAveraging: 1,
    spectralResolution: '13.44 kHz (575.6 m/s)',
    effectiveResolution: '13.44 kHz (615.1 m/s)'
  }
];

function mountDefault() {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme('light')}>
        <CssBaseline />
        <EffectiveResolutionField
          frequency={1}
          frequencyUnits={1}
          observingBand={1}
          observationType={1}
          spectralAveraging={1}
          spectralResolution={'123 MHz'}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

function mount(
  frequency: number,
  frequencyUnits: number,
  observingBand: number,
  observationType: number,
  spectralAveraging: number,
  spectralResolution: string
) {
  viewPort();
  cy.mount(
    <StoreProvider>
      <ThemeProvider theme={theme('light')}>
        <CssBaseline />
        <EffectiveResolutionField
          frequency={frequency}
          frequencyUnits={frequencyUnits}
          label={TEST_LABEL}
          observingBand={observingBand}
          observationType={observationType}
          setValue={cy.stub().as('action')}
          spectralAveraging={spectralAveraging}
          spectralResolution={spectralResolution}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}

const Averaging = (inValue: { spectralAveraging: number }) => {
  return inValue.spectralAveraging + '...';
};

const Band = (inValue: { observingBand: number }) => {
  switch (inValue.observingBand) {
    case 1:
      return 'MID 1.';
    case 2:
      return 'MID 2.';
    case 3:
      return 'MID 5a';
    case 4:
      return 'MID 5b';
    default:
      return 'LOW...';
  }
};

const SR = (inValue: { spectralResolution }) => {
  return inValue.spectralResolution;
};

const Type = (inValue: { observationType: number }) => {
  return inValue.observationType === TYPE_ZOOM ? 'Zoom' : 'Cont';
};

const Properties = rec => {
  return `${Band(rec)} | ${Type(rec)} | ${Averaging(rec)} | ${SR(rec)}`;
};

describe('<EffectiveResolution />', () => {
  it(`Band.. | Type. | Avg | Spectral => Results`, () => {
    mountDefault();
  });
  for (const rec of DATA) {
    it(`${Properties(rec)} => ${rec.effectiveResolution}`, () => {
      mount(
        rec.frequency,
        rec.frequencyUnits,
        rec.observingBand,
        rec.observationType,
        rec.spectralAveraging,
        rec.spectralResolution
      );
      cy.get('#effectiveResolution').should('have.value', rec.effectiveResolution);
    });
  }
});
