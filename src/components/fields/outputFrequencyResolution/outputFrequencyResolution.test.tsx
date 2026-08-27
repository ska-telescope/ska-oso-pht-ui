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

  test('snaps to nearest valid multiple on blur when value is non-multiple', async () => {
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
    expect(handleSetValue).toHaveBeenCalledWith(2);
    expect(screen.queryByText('multiple-3.62')).not.toBeInTheDocument();
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
