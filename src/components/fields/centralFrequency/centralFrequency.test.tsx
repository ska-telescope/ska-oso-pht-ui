// CentralFrequency.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import CentralFrequency from './centralFrequency';
import { BAND_LOW_STR } from '@/utils/constants.ts';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

vi.mock(import('@/utils/constants.ts'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual
    // your mocked methods
  };
});

// Mock the translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key // just return the key for testing
  })
}));

// Mock the help hook
const setHelpMock = vi.fn();
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({
    setHelp: setHelpMock
  })
}));

// Mock useOSDAccessors so findBand returns a known 50-350 MHz LOW band for the window-clamping
// tests, and osdLOW provides a coarse channel width for the non-clamped mode's
// divisibility validation.
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    findBand: () => ({ minFrequencyHz: 50_000_000, maxFrequencyHz: 350_000_000 }),
    telescopeBand: () => 2, // TELESCOPE_LOW_NUM
    osdLOW: { basicCapabilities: { coarseChannelWidthHz: 781250 } }
  })
}));

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

// On blur, SteppedNumberField resyncs its displayed text from the component's own `value` prop
// regardless of typing - a mocked setValue that doesn't feed into a re-render would make that
// resync revert to the stale initial value instead of what was actually typed. This wires value/
// setValue together like a real caller would.
const StatefulCentralFrequency = ({
  initial,
  isLowZoom,
  channelWidthHz,
  windowBandwidthHz
}: {
  initial: number;
  isLowZoom?: boolean;
  channelWidthHz?: number;
  windowBandwidthHz?: number;
}) => {
  const [value, setValue] = React.useState(initial);
  return (
    <CentralFrequency
      observingBand={BAND_LOW_STR}
      value={value}
      setValue={setValue}
      isLowZoom={isLowZoom}
      channelWidthHz={channelWidthHz}
      windowBandwidthHz={windowBandwidthHz}
    />
  );
};

describe('CentralFrequency component', () => {
  it('renders with initial value', () => {
    wrapper(<CentralFrequency observingBand={BAND_LOW_STR} value={150} setValue={vi.fn()} />);
  });

  it('Continuum/MID mode still renders the stepped number field (same control, coarse-channel-grid stepping instead of window-clamping)', () => {
    wrapper(<CentralFrequency observingBand={BAND_LOW_STR} value={150} setValue={vi.fn()} />);
    expect(screen.getByLabelText('centralFrequency.label')).toBeInTheDocument();
    expect(screen.getByLabelText('centralFrequency-increment')).toBeInTheDocument();
  });

  it('Continuum/MID mode steps by one coarse-channel-grid unit on increment', async () => {
    const setValue = vi.fn();
    // A valid centre frequency sits at a half-channel offset from 0 Hz (192.5 x 0.78125 MHz
    // channels here), not merely a multiple of the 1.5625 MHz step from the band minimum.
    wrapper(
      <CentralFrequency observingBand={BAND_LOW_STR} value={150.390625} setValue={setValue} />
    );
    await userEvent.click(screen.getByLabelText('centralFrequency-increment'));
    expect(setValue).toHaveBeenCalledWith(151.953125);
  });

  it('Low zoom mode renders a stepped number field and calls setValue on increment', async () => {
    const setValue = vi.fn();
    wrapper(
      <CentralFrequency
        observingBand={BAND_LOW_STR}
        value={200}
        setValue={setValue}
        isLowZoom
        channelWidthHz={1808.449074}
        windowBandwidthHz={1_808_449.074}
      />
    );
    await userEvent.click(screen.getByLabelText('centralFrequency-increment'));
    expect(setValue).toHaveBeenCalledWith(200.001808);
  });

  it(' mode accepts a typed value when the whole window fits in the band', async () => {
    const setValue = vi.fn();
    wrapper(
      <CentralFrequency
        observingBand={BAND_LOW_STR}
        value={200}
        setValue={setValue}
        isLowZoom
        channelWidthHz={1808.449074}
        windowBandwidthHz={1_808_449.074} // 1.808449074 MHz wide window
      />
    );
    const input = screen.getByTestId('centralFrequency');
    await userEvent.clear(input);
    await userEvent.type(input, '300');
    expect(setValue).toHaveBeenCalledWith(300);
    expect(screen.queryByText('centralFrequency.error.range')).not.toBeInTheDocument();
  });

  it('Low zoom mode accepts an out-of-range typed value but flags a range error, rather than rejecting it', async () => {
    const setValue = vi.fn();
    wrapper(
      <CentralFrequency
        observingBand={BAND_LOW_STR}
        value={200}
        setValue={setValue}
        isLowZoom
        channelWidthHz={1808.449074}
        windowBandwidthHz={1_808_449.074}
      />
    );
    // Window is ~0.9 MHz either side of centre - centring on 50 MHz would spill below the band.
    const input = screen.getByTestId('centralFrequency');
    await userEvent.clear(input);
    await userEvent.type(input, '50');
    expect(setValue).toHaveBeenCalledWith(50);
    expect(screen.getByText('centralFrequency.error.range')).toBeInTheDocument();
  });

  it('Low zoom mode flags a divisibility error for an off-grid typed value, without auto-snapping it on blur', async () => {
    wrapper(
      <StatefulCentralFrequency
        initial={200}
        isLowZoom
        channelWidthHz={1808.449074}
        windowBandwidthHz={1_808_449.074}
      />
    );
    const input = screen.getByTestId('centralFrequency') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '123.456'); // in range, but not on the channel grid
    expect(screen.getByText('centralFrequency.error.divisibility')).toBeInTheDocument();
    await userEvent.tab(); // blur - should not silently correct the value
    expect(input.value).toBe('123.456');
    expect(screen.getByText('centralFrequency.error.divisibility')).toBeInTheDocument();
  });

  it('LOW zoom mode clamps an increment so the window never spills past the band edge', async () => {
    const setValue = vi.fn();
    wrapper(
      <CentralFrequency
        observingBand={BAND_LOW_STR}
        value={349.999} // window's upper edge (349.999 + ~0.9 MHz) already exceeds 350 MHz
        setValue={setValue}
        isLowZoom
        channelWidthHz={1808.449074}
        windowBandwidthHz={1_808_449.074}
      />
    );
    await userEvent.click(screen.getByLabelText('centralFrequency-increment'));
    const [[committed]] = setValue.mock.calls;
    expect(committed).toBeLessThanOrEqual(350 - 1_808_449.074 / 1_000_000 / 2 + 1e-6);
  });
});
