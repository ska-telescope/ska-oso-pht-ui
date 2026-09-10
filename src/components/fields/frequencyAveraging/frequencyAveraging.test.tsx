import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import FrequencyAveraging from './frequencyAveraging';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => {
      if (key === 'frequencyAveraging.label') return 'Frequency averaging';
      if (key === 'frequencyAveraging.0') return 'kHz';
      return key;
    }
  })
}));

describe('<FrequencyAveraging />', () => {
  test('renders the value in kHz to two decimal places', () => {
    render(
      <StoreProvider>
        <FrequencyAveraging value={1} />
      </StoreProvider>
    );

    expect(screen.getByRole('spinbutton')).toHaveValue(5.43);
    expect(screen.getByText('kHz')).toBeInTheDocument();
  });

  test('commits the integer multiplier for a displayed value', () => {
    const setValue = vi.fn();
    render(
      <StoreProvider>
        <FrequencyAveraging value={2} setValue={setValue} />
      </StoreProvider>
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5.43' } });
    expect(setValue).toHaveBeenCalledWith(1);
  });

  test('shows an error for multipliers outside the range', () => {
    const setValue = vi.fn();
    render(
      <StoreProvider>
        <FrequencyAveraging value={1} setValue={setValue} />
      </StoreProvider>
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '70' } });
    expect(setValue).toHaveBeenCalled();
    expect(screen.getByText('frequencyAveraging.error')).toBeInTheDocument();
  });

  test('steps by one multiplier within the allowed range', () => {
    const setValue = vi.fn();
    render(
      <StoreProvider>
        <FrequencyAveraging value={2} setValue={setValue} />
      </StoreProvider>
    );
    fireEvent.click(screen.getByTestId('frequencyAveragingIncrement'));
    fireEvent.click(screen.getByTestId('frequencyAveragingDecrement'));
    expect(setValue).toHaveBeenNthCalledWith(1, 3);
    expect(setValue).toHaveBeenNthCalledWith(2, 1);
  });

  test('passes disabled state to the field', () => {
    render(
      <StoreProvider>
        <FrequencyAveraging value={2} disabled />
      </StoreProvider>
    );

    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });
});
