import { describe, test, vi, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import OutputSamplingIntervalField from './outputSamplingInterval';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (k: string, args?: Record<string, string>) =>
      k === 'outputSamplingInterval.error.multiple' ? `multiple-${args?.value ?? ''}` : k
  })
}));
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({ setHelp: () => {} })
}));

describe('<OutputSamplingIntervalField />', () => {
  test('renders value to three decimal places in ms', async () => {
    render(
      <StoreProvider>
        <OutputSamplingIntervalField value={1} setValue={vi.fn()} />
      </StoreProvider>
    );
    const input = screen.getByTestId('outputSamplingInterval') as HTMLInputElement;
    expect(input.value).toBe('0.207');
  });

  test('steps to next multiple without validation error', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputSamplingIntervalField value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    fireEvent.click(screen.getByTestId('outputSamplingIntervalIncrement'));
    expect(handleSetValue).toHaveBeenCalledWith(2);
    expect(screen.queryByText('multiple-0.207')).not.toBeInTheDocument();
  });

  test('accepts its own rounded displayed value when typed', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputSamplingIntervalField value={2} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByTestId('outputSamplingInterval') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 0.207 } });
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledWith(1);
    expect(screen.queryByText('multiple-0.207')).not.toBeInTheDocument();
  });

  test('snaps to nearest valid multiple on blur when value is non-multiple', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <OutputSamplingIntervalField value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByTestId('outputSamplingInterval') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 0.5 } });
    expect(screen.getByText('multiple-0.207')).toBeInTheDocument();
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledWith(2);
    expect(screen.queryByText('multiple-0.207')).not.toBeInTheDocument();
  });

  test('renders fixed disabled units dropdown', async () => {
    render(
      <StoreProvider>
        <OutputSamplingIntervalField value={1} setValue={vi.fn()} />
      </StoreProvider>
    );
    const units = screen.getByTestId('outputSamplingIntervalUnits');
    expect(units).toHaveTextContent('outputSamplingInterval.units');
    const fieldRoot = within(units.parentElement as HTMLElement).getByRole('combobox');
    expect(fieldRoot).toHaveAttribute('aria-disabled', 'true');
  });
});
