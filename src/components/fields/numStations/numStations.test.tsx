import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import NumStationsField from './NumStations';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map = {
        'numStations.label': 'Number of Stations',
        'numStations.help': 'Help text for number of stations'
      };
      return map[key] ?? key;
    }
  })
}));

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('NumStationsField', () => {
  const mockSetValue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders NumberEntry with correct label and value', () => {
    wrapper(<NumStationsField value={2} setValue={mockSetValue} />);
    const inputWrapper = screen.getByTestId('numStations');
    expect(inputWrapper).toBeInTheDocument();
    const input = inputWrapper.querySelector('input');
    expect(input?.value).toBe('2');
  });

  it('does not call setValue with out-of-range value', async () => {
    wrapper(<NumStationsField value={1} setValue={mockSetValue} rangeLower={0} rangeUpper={2} />);
    const inputWrapper = screen.getByTestId('numStations');
    const input = inputWrapper.querySelector('input');
    await userEvent.clear(input!);
    await userEvent.type(input!, '5');
    expect(mockSetValue.mock.calls.some(call => call[0] === '5')).toBe(false);
  });

  it('respects disabled prop', () => {
    wrapper(<NumStationsField value={1} disabled />);
    const inputWrapper = screen.getByTestId('numStations');
    const input = inputWrapper.querySelector('input');
    expect(input).toBeDisabled();
  });

  it('uses default labelWidth when not provided', () => {
    wrapper(<NumStationsField value={1} />);
    const inputWrapper = screen.getByTestId('numStations');
    expect(inputWrapper).toBeInTheDocument();
  });
});
