import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SpectralResolution from './SpectralResolution';
import { BAND_LOW_STR, TYPE_CONTINUUM } from '@/utils/constants';

describe('<SpectralResolution />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SpectralResolution
          bandWidth={0}
          bandWidthUnits={0}
          frequency={0}
          frequencyUnits={0}
          observingBand={BAND_LOW_STR}
          observationType={TYPE_CONTINUUM}
        />
      </StoreProvider>
    );
  });
});
