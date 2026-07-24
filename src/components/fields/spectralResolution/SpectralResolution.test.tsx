import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SpectralResolution from './SpectralResolution';
import { BAND_LOW_STR, SA_AA2, SA_CUSTOM, TYPE_CONTINUUM, TYPE_ZOOM } from '@/utils/constants';

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

  test('non-interactive mode still renders the disabled read-only display, ignoring subarrayConfig', () => {
    render(
      <StoreProvider>
        <SpectralResolution
          bandWidth={3}
          bandWidthUnits={0}
          frequency={200}
          frequencyUnits={2}
          observingBand={BAND_LOW_STR}
          observationType={TYPE_ZOOM}
          subarrayConfig={SA_AA2}
        />
      </StoreProvider>
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('56.51 Hz (84.7 m/s)')).toBeInTheDocument();
  });

  test('interactive mode renders only the 4 coarse options for a fine-zoom-restricted subarray', () => {
    render(
      <StoreProvider>
        <SpectralResolution
          bandWidth={8}
          bandWidthUnits={0}
          frequency={200}
          frequencyUnits={2}
          interactive
          observingBand={BAND_LOW_STR}
          observationType={TYPE_ZOOM}
          setBandWidth={vi.fn()}
          subarrayConfig={SA_AA2}
        />
      </StoreProvider>
    );
    expect(screen.getByTestId('spectralResolution')).toHaveTextContent('1808.45 Hz');
  });

  test('interactive mode snaps a fine mode up to the coarsest one for a restricted subarray', () => {
    const setBandWidth = vi.fn();
    render(
      <StoreProvider>
        <SpectralResolution
          bandWidth={2}
          bandWidthUnits={0}
          frequency={200}
          frequencyUnits={2}
          interactive
          observingBand={BAND_LOW_STR}
          observationType={TYPE_ZOOM}
          setBandWidth={setBandWidth}
          subarrayConfig={SA_AA2}
        />
      </StoreProvider>
    );
    expect(setBandWidth).toHaveBeenCalledWith(5);
    expect(screen.getByTestId('spectralResolution')).toHaveTextContent('226.06 Hz');
  });

  test('interactive mode allows fine modes for an unrestricted subarray', () => {
    const setBandWidth = vi.fn();
    render(
      <StoreProvider>
        <SpectralResolution
          bandWidth={2}
          bandWidthUnits={0}
          frequency={200}
          frequencyUnits={2}
          interactive
          observingBand={BAND_LOW_STR}
          observationType={TYPE_ZOOM}
          setBandWidth={setBandWidth}
          subarrayConfig={SA_CUSTOM}
        />
      </StoreProvider>
    );
    expect(setBandWidth).not.toHaveBeenCalled();
    expect(screen.getByTestId('spectralResolution')).toHaveTextContent('28.26 Hz');
  });
});
