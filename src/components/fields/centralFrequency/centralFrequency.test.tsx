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
// (steppable) tests, and osdLOW provides a coarse channel width for the non-steppable mode's
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

// onBlurCommit reads back the component's own `value` prop, so a mocked setValue that doesn't
// feed into a re-render can't exercise a real type-then-blur round trip - this wires value/
// setValue together like a real caller would.
const StatefulCentralFrequency = ({ initial }: { initial: number }) => {
  const [value, setValue] = React.useState(initial);
  return <CentralFrequency observingBand={BAND_LOW_STR} value={value} setValue={setValue} />;
};

describe('CentralFrequency component', () => {
  it('renders with initial value', () => {
    wrapper(<CentralFrequency observingBand={BAND_LOW_STR} value={150} setValue={vi.fn()} />);
  });

  it('non-steppable mode still renders the stepped number field (same control, coarse-channel-grid stepping instead of window-clamping)', () => {
    wrapper(<CentralFrequency observingBand={BAND_LOW_STR} value={150} setValue={vi.fn()} />);
    expect(screen.getByLabelText('centralFrequency.label')).toBeInTheDocument();
    expect(screen.getByLabelText('centralFrequency-increment')).toBeInTheDocument();
  });

  it('non-steppable mode steps by one coarse-channel-grid unit on increment', async () => {
    const setValue = vi.fn();
    // 150 MHz is already grid-aligned (50 + 64 x 1.5625 MHz coarse-channel step).
    wrapper(<CentralFrequency observingBand={BAND_LOW_STR} value={150} setValue={setValue} />);
    await userEvent.click(screen.getByLabelText('centralFrequency-increment'));
    expect(setValue).toHaveBeenCalledWith(151.5625);
  });

  it('non-steppable mode does not snap while typing, only on blur', async () => {
    wrapper(<StatefulCentralFrequency initial={150} />);
    const input = screen.getByTestId('centralFrequency') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '155'); // not on the 1.5625 MHz grid
    expect(input.value).toBe('155');
    await userEvent.tab(); // blur
    expect(input.value).toBe('154.6875'); // snapped to the nearest grid point
  });

  it('steppable mode renders a stepped number field and calls setValue on increment', async () => {
    const setValue = vi.fn();
    wrapper(
      <CentralFrequency
        observingBand={BAND_LOW_STR}
        value={200}
        setValue={setValue}
        steppable
        channelWidthHz={1808.449074}
        windowBandwidthHz={1_808_449.074}
      />
    );
    await userEvent.click(screen.getByLabelText('centralFrequency-increment'));
    expect(setValue).toHaveBeenCalledWith(200.001808);
  });

  it('steppable mode accepts a typed value when the whole window fits in the band', async () => {
    const setValue = vi.fn();
    wrapper(
      <CentralFrequency
        observingBand={BAND_LOW_STR}
        value={200}
        setValue={setValue}
        steppable
        channelWidthHz={1808.449074}
        windowBandwidthHz={1_808_449.074} // 1.808449074 MHz wide window
      />
    );
    const input = screen.getByTestId('centralFrequency');
    await userEvent.clear(input);
    await userEvent.type(input, '300');
    expect(setValue).toHaveBeenCalledWith(300);
    expect(screen.queryByText('centralFrequency.range.error')).not.toBeInTheDocument();
  });

  it('steppable mode rejects a typed value where the window would spill outside the band', async () => {
    const setValue = vi.fn();
    wrapper(
      <CentralFrequency
        observingBand={BAND_LOW_STR}
        value={200}
        setValue={setValue}
        steppable
        channelWidthHz={1808.449074}
        windowBandwidthHz={1_808_449.074}
      />
    );
    // Window is ~0.9 MHz either side of centre - centring on 50 MHz would spill below the band.
    const input = screen.getByTestId('centralFrequency');
    await userEvent.clear(input);
    await userEvent.type(input, '50');
    expect(setValue).not.toHaveBeenCalled();
    expect(screen.getByText('centralFrequency.range.error')).toBeInTheDocument();
  });

  it('steppable mode clamps an increment so the window never spills past the band edge', async () => {
    const setValue = vi.fn();
    wrapper(
      <CentralFrequency
        observingBand={BAND_LOW_STR}
        value={349.999} // window's upper edge (349.999 + ~0.9 MHz) already exceeds 350 MHz
        setValue={setValue}
        steppable
        channelWidthHz={1808.449074}
        windowBandwidthHz={1_808_449.074}
      />
    );
    await userEvent.click(screen.getByLabelText('centralFrequency-increment'));
    const [[committed]] = setValue.mock.calls;
    expect(committed).toBeLessThanOrEqual(350 - 1_808_449.074 / 1_000_000 / 2 + 1e-6);
  });
});
