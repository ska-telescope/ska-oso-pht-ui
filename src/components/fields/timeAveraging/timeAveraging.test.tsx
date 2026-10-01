import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import TimeAveraging from './timeAveraging';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => {
      if (key === 'timeAveraging.label') return 'Time averaging';
      if (key === 'timeAveraging.0') return 'seconds';
      return key;
    }
  })
}));

describe('<TimeAveraging />', () => {
  test('renders the value in seconds to three decimal places', () => {
    render(
      <StoreProvider>
        <TimeAveraging value={1} />
      </StoreProvider>
    );

    expect(screen.getByRole('spinbutton')).toHaveValue(0.849);
    expect(screen.getByText('seconds')).toBeInTheDocument();
  });

  test('commits the integer multiplier for a displayed value', () => {
    const setValue = vi.fn();
    render(
      <StoreProvider>
        <TimeAveraging value={2} setValue={setValue} />
      </StoreProvider>
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0.849' } });
    expect(setValue).toHaveBeenCalledWith(1);
  });

  test('shows a range error for multipliers outside the range', () => {
    const setValue = vi.fn();
    render(
      <StoreProvider>
        <TimeAveraging value={1} setValue={setValue} />
      </StoreProvider>
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '11' } });
    expect(setValue).toHaveBeenCalled();
    expect(screen.getByText('timeAveraging.error.range')).toBeInTheDocument();
  });

  test('shows a step error for values between allowed steps', () => {
    render(
      <StoreProvider>
        <TimeAveraging value={1} setValue={vi.fn()} />
      </StoreProvider>
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } });
    expect(screen.getByText('timeAveraging.error.step')).toBeInTheDocument();
  });

  test('steps by one multiplier within the allowed range', () => {
    const setValue = vi.fn();
    render(
      <StoreProvider>
        <TimeAveraging value={2} setValue={setValue} />
      </StoreProvider>
    );
    fireEvent.click(screen.getByTestId('timeAveragingIncrement'));
    fireEvent.click(screen.getByTestId('timeAveragingDecrement'));
    expect(setValue).toHaveBeenNthCalledWith(1, 3);
    expect(setValue).toHaveBeenNthCalledWith(2, 1);
  });

  test('passes disabled state to the field', () => {
    render(
      <StoreProvider>
        <TimeAveraging value={2} disabled />
      </StoreProvider>
    );

    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });
});
