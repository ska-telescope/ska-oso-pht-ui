import { describe, test, vi, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import OutputFrequencyResolutionField from './outputFrequencyResolution';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (k: string, args?: Record<string, string>) =>
      k === 'outputFrequencyResolution.error.multiple' ? `multiple-${args?.value ?? ''}` : k
  })
}));
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({ setHelp: () => {} })
}));

describe('<OutputFrequencyResolutionField />', () => {
  test('renders value to two decimal places in kHz', async () => {
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} setValue={vi.fn()} />
      </StoreProvider>
    );
    const input = screen.getByTestId('outputFrequencyResolution') as HTMLInputElement;
    expect(input.value).toBe('3.62');
  });

  test('steps to next multiple without validation error', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    fireEvent.click(screen.getByTestId('outputFrequencyResolutionIncrement'));
    expect(handleSetValue).toHaveBeenCalledWith(2);
    expect(screen.queryByText('multiple-3.62')).not.toBeInTheDocument();
  });

  test('decrement at minimum keeps displayed value stable', async () => {
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} setValue={vi.fn()} />
      </StoreProvider>
    );
    const input = screen.getByTestId('outputFrequencyResolution') as HTMLInputElement;
    fireEvent.click(screen.getByTestId('outputFrequencyResolutionDecrement'));
    expect(input.value).toBe('3.62');
  });

  test('accepts its own rounded displayed value when typed', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={2} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByTestId('outputFrequencyResolution') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 3.62 } });
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledWith(1);
    expect(screen.queryByText('multiple-3.62')).not.toBeInTheDocument();
  });

  test('commits fractional multiplier and keeps validation error for non-multiple input', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByTestId('outputFrequencyResolution') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 7.0 } });
    expect(screen.getByText('multiple-3.62')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledTimes(1);
    expect(handleSetValue.mock.calls[0][0]).toBeCloseTo(1.93536, 5);
    expect(screen.getByText('multiple-3.62')).toBeInTheDocument();
  });

  test('does not commit an additional value after clearing a non-multiple', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByTestId('outputFrequencyResolution') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 7.0 } });
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledTimes(1);
    expect(handleSetValue.mock.calls[0][0]).toBeCloseTo(1.93536, 5);
    expect(input.value).toBe('3.62');
  });

  test('resets displayed value after blocked step while preserving current error', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByTestId('outputFrequencyResolution') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 7.0 } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('3.62');
    expect(screen.getByText('multiple-3.62')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledTimes(1);
    expect(handleSetValue.mock.calls[0][0]).toBeCloseTo(1.93536, 5);
  });

  test('renders fixed disabled units dropdown', async () => {
    render(
      <StoreProvider>
        <OutputFrequencyResolutionField value={1} setValue={vi.fn()} />
      </StoreProvider>
    );
    const units = screen.getByTestId('outputFrequencyResolutionUnits');
    expect(units).toHaveTextContent('outputFrequencyResolution.units');
    const fieldRoot = within(units.parentElement as HTMLElement).getByRole('combobox');
    expect(fieldRoot).toHaveAttribute('aria-disabled', 'true');
  });
});
