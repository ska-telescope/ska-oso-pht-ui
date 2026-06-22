import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import ChannelsOut from './channelsOut';

// Mock the translation hook so validation output is deterministic
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts && opts.min !== undefined ? `${key}:${opts.min}-${opts.max}` : key
  })
}));

// Stub NumberEntry as a plain input so we can drive setValue (checkValue) and
// observe errorText in isolation. Two non-obvious details are noted inline below.
vi.mock('@ska-telescope/ska-gui-components', () => ({
  // (1) constants.ts reads these at module load — e.g. LAB_POS_TICK = LABEL_POSITION.START
  // and TELESCOPE_MID/LOW.code — so the mock must define them even though the
  // component itself only uses NumberEntry.
  LABEL_POSITION: { CONTAINED: 'contained', START: 'start', TOP: 'top', BOTTOM: 'bottom', END: 'end' },
  TELESCOPE_MID: { code: 'mid' },
  TELESCOPE_LOW: { code: 'low' },
  NumberEntry: ({ setValue, errorText, testId }: any) => (
    <div>
      {/* (2) Uncontrolled on purpose: a controlled input (value={value}) makes React
          suppress onChange when the entered value equals the prop, which silently
          broke the "accepts 1" case since the field initialises at value 1. */}
      <input
        data-testid={testId}
        onChange={e => setValue(Number(e.target.value))}
      />
      {errorText && <span data-testid={`${testId}-error`}>{errorText}</span>}
    </div>
  )
}));

describe('<ChannelsOut />', () => {
  const mockSetValue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Prevent the error-clearing timer (ERROR_SECS) from firing mid-test
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const enterValue = (v: number) =>
    fireEvent.change(screen.getByTestId('channelsOut'), { target: { value: String(v) } });

  test('renders correctly', () => {
    render(<ChannelsOut value={1} setValue={mockSetValue} />);
    expect(screen.getByTestId('channelsOut')).toBeInTheDocument();
  });

  test.each([[1], [40]])('accepts valid value %i and calls setValue', value => {
    render(<ChannelsOut value={1} setValue={mockSetValue} />);
    enterValue(value);
    expect(mockSetValue).toHaveBeenCalledWith(value);
    expect(screen.queryByTestId('channelsOut-error')).not.toBeInTheDocument();
  });

  test.each([[0], [1.5], [41]])('rejects invalid value %s without calling setValue', value => {
    render(<ChannelsOut value={1} setValue={mockSetValue} />);
    enterValue(value);
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(screen.getByTestId('channelsOut-error')).toBeInTheDocument();
  });
});
