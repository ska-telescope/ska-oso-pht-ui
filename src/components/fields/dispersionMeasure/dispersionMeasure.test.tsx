import { describe, test, vi, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import DispersionMeasureField from './dispersionMeasure';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (k: string) => k })
}));
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({ setHelp: () => {} })
}));

describe('<DispersionMeasureField />', () => {
  test('updates correctly when value changed', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <DispersionMeasureField value={0} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 250 } });
    expect(handleSetValue).toHaveBeenCalledWith(Number(250));
  });

  test('allows decimal free-text entry', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <DispersionMeasureField value={0} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 1.5 } });
    expect(handleSetValue).toHaveBeenCalledWith(Number(1.5));
    expect(screen.queryByText('dispersionMeasure.range.error')).not.toBeInTheDocument();
  });

  test('shows range error when value changed to negative', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <DispersionMeasureField value={0} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: -1 } });
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledWith(Number(-1));
    expect(screen.getByText('dispersionMeasure.range.error')).toBeInTheDocument();
  });

  test('shows range error when value exceeds maximum', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <DispersionMeasureField value={0} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 100001 } });
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledWith(Number(100001));
    expect(screen.getByText('dispersionMeasure.range.error')).toBeInTheDocument();
  });

  test('renders fixed disabled units dropdown', async () => {
    render(
      <StoreProvider>
        <DispersionMeasureField value={0} setValue={vi.fn()} />
      </StoreProvider>
    );
    const units = screen.getByTestId('dispersionMeasureUnits');
    expect(units).toHaveTextContent('dispersionMeasure.units');
    const fieldRoot = within(units.parentElement as HTMLElement).getByRole('combobox');
    expect(fieldRoot).toHaveAttribute('aria-disabled', 'true');
  });
});
