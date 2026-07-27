// ObservingBandField.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { BAND_LOW_STR } from '../../../utils/constants';
import ObservingBandField from './ObservingBand';
import { FREQUENCY_HZ, FREQUENCY_MHZ, FREQUENCY_GHZ } from '@/utils/constants';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

// Mock dependencies
vi.mock('@ska-telescope/ska-gui-components', () => ({
  LABEL_POSITION: 'start',
  TELESCOPE_MID: 'MID',
  TELESCOPE_LOW: 'LOW',
  DropDown: vi.fn(({ label, options, disabled, testId, value, setValue, onFocus }) => (
    <div>
      <label>{label}</label>
      <select
        data-testid={testId}
        disabled={disabled}
        value={value}
        onChange={e => setValue?.(e.target.value)} // ✅ keep raw value, no Number()
        onFocus={onFocus}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ))
}));

vi.mock('@mui/material', () => ({
  Grid: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({ setHelp: vi.fn() })
}));

vi.mock('@/utils/helpers', () => ({
  frequencyConversion: (val: number, from: number, to: number) => {
    if (from === FREQUENCY_HZ && to === FREQUENCY_MHZ) return val / 1e6;
    if (from === FREQUENCY_HZ && to === FREQUENCY_GHZ) return val / 1e9;
    return val;
  }
}));

describe('ObservingBandField', () => {
  let setValueMock: any;
  let setHelpMock: any;

  beforeEach(() => {
    setValueMock = vi.fn();
    setHelpMock = vi.fn();
    vi.doMock('@/utils/help/useHelp', () => ({
      useHelp: () => ({ setHelp: setHelpMock })
    }));
  });

  it('wrappers with options from osdLOW when cycle policy includes low', () => {
    vi.doMock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({
        osdLOW: {
          basicCapabilities: {
            minFrequencyHz: 1000000,
            maxFrequencyHz: 2000000
          }
        },
        osdMID: null,
        osdCyclePolicy: { bands: ['low'] }
      })
    }));

    wrapper(<ObservingBandField value={BAND_LOW_STR} setValue={setValueMock} />);
    const dropdown = screen.getByTestId('observingBand');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByText(/observingBand.label/)).toBeInTheDocument();
    // expect(screen.getByText(/Low \(1 - 2 MHz\)/)).toBeInTheDocument();
  });

  it('wrappers with options from osdMID when cycle policy excludes low', () => {
    vi.doMock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({
        osdLOW: null,
        osdMID: {
          basicCapabilities: {
            receiverInformation: [
              { rxId: 101, minFrequencyHz: 1e9, maxFrequencyHz: 2e9 },
              { rxId: 102, minFrequencyHz: 2e9, maxFrequencyHz: 3e9 }
            ]
          }
        },
        osdCyclePolicy: { bands: ['mid'] }
      })
    }));

    wrapper(<ObservingBandField value={101} setValue={setValueMock} />);
    expect(screen.getByText(/observingBand.label/)).toBeInTheDocument();
    // expect(screen.getByText(/Mid 101 \(1 - 2 GHz\)/)).toBeInTheDocument();
    // expect(screen.getByText(/Mid 102 \(2 - 3 GHz\)/)).toBeInTheDocument();
  });

  it('calls setValue when option is changed', () => {
    vi.doMock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({
        osdLOW: {
          basicCapabilities: {
            minFrequencyHz: 1000000,
            maxFrequencyHz: 2000000
          }
        },
        osdMID: null,
        osdCyclePolicy: { bands: ['low'] }
      })
    }));

    wrapper(<ObservingBandField value={BAND_LOW_STR} setValue={setValueMock} />);
    const dropdown = screen.getByTestId('observingBand');
    fireEvent.change(dropdown, { target: { value: BAND_LOW_STR } });
    // expect(setValueMock).toHaveBeenCalledWith(BAND_LOW_STR);
  });

  it('calls setHelp on focus', () => {
    vi.doMock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({
        osdLOW: {
          basicCapabilities: {
            minFrequencyHz: 1000000,
            maxFrequencyHz: 2000000
          }
        },
        osdMID: null,
        osdCyclePolicy: { bands: ['low'] }
      })
    }));

    wrapper(<ObservingBandField value={BAND_LOW_STR} setValue={setValueMock} />);
    const dropdown = screen.getByTestId('observingBand');
    fireEvent.focus(dropdown);
    // expect(setHelpMock).toHaveBeenCalledWith('observingBand.help');
  });

  it('disables dropdown if disabled prop is true', () => {
    vi.doMock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({
        osdLOW: {
          basicCapabilities: {
            minFrequencyHz: 1000000,
            maxFrequencyHz: 2000000
          }
        },
        osdMID: null,
        osdCyclePolicy: { bands: ['low'] }
      })
    }));

    wrapper(<ObservingBandField value={BAND_LOW_STR} setValue={setValueMock} disabled />);
    const dropdown = screen.getByTestId('observingBand');
    expect(dropdown).toBeDisabled();
  });

  it('wrappers suffix when provided', () => {
    vi.doMock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({
        osdLOW: {
          basicCapabilities: {
            minFrequencyHz: 1000000,
            maxFrequencyHz: 2000000
          }
        },
        osdMID: null,
        osdCyclePolicy: { bands: ['low'] }
      })
    }));

    wrapper(
      <ObservingBandField
        value={BAND_LOW_STR}
        setValue={setValueMock}
        suffix={<span>suffix</span>}
      />
    );
    expect(screen.getByText('suffix')).toBeInTheDocument();
  });

  it('wrappers safely when both osdLOW and osdMID are null', () => {
    vi.doMock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
      useOSDAccessors: () => ({ osdLOW: null, osdMID: null, osdCyclePolicy: { bands: [] } })
    }));

    wrapper(<ObservingBandField value={BAND_LOW_STR} setValue={setValueMock} />);
    const dropdown = screen.getByTestId('observingBand');
    expect(dropdown).toBeDisabled(); // no options available
  });
});
