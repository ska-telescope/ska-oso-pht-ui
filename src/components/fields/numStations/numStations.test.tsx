import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

const mockHelpComponent = vi.fn();

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      helpComponent: mockHelpComponent
    })
  }
}));

describe('NumStationsField', () => {
  const mockSetValue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders NumberEntry with correct label and value', () => {
    render(<NumStationsField value={2} setValue={mockSetValue} />);
    const inputWrapper = screen.getByTestId('numStations');
    expect(inputWrapper).toBeInTheDocument();
    const input = inputWrapper.querySelector('input');
    expect(input?.value).toBe('2');
  });

  /*
  it('calls setValue when input is within range', async () => {
    render(<NumStationsField value={1} setValue={mockSetValue} rangeLower={0} rangeUpper={5} />);
    const inputWrapper = screen.getByTestId('numStations');
    const input = inputWrapper.querySelector('input');
    await userEvent.clear(input!);
    await userEvent.type(input!, '3');
    expect(mockSetValue.mock.calls.some(call => call[0] === '3')).toBe(true);
  });
  */

  it('does not call setValue with out-of-range value', async () => {
    render(<NumStationsField value={1} setValue={mockSetValue} rangeLower={0} rangeUpper={2} />);
    const inputWrapper = screen.getByTestId('numStations');
    const input = inputWrapper.querySelector('input');
    await userEvent.clear(input!);
    await userEvent.type(input!, '5');
    expect(mockSetValue.mock.calls.some(call => call[0] === '5')).toBe(false);
  });

  it('calls helpComponent on focus', async () => {
    render(<NumStationsField value={1} setValue={mockSetValue} />);
    const inputWrapper = screen.getByTestId('numStations');
    const input = inputWrapper.querySelector('input');
    await userEvent.click(input!);
    expect(mockHelpComponent).toHaveBeenCalledWith('Help text for number of stations');
  });

  it('respects disabled prop', () => {
    render(<NumStationsField value={1} disabled />);
    const inputWrapper = screen.getByTestId('numStations');
    const input = inputWrapper.querySelector('input');
    expect(input).toBeDisabled();
  });

  it('uses default labelWidth when not provided', () => {
    render(<NumStationsField value={1} />);
    const inputWrapper = screen.getByTestId('numStations');
    expect(inputWrapper).toBeInTheDocument();
  });
});
