import { describe, test, vi, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import RotationMeasureField from './rotationMeasure';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (k: string) => k })
}));
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({ setHelp: () => {} })
}));

describe('<RotationMeasureField />', () => {
  test('updates correctly when value changed', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <RotationMeasureField value={0} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 250 } });
    expect(handleSetValue).toHaveBeenCalledWith(Number(250));
  });

  test('updates correctly when value changed to negative integer', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <RotationMeasureField value={0} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: -250 } });
    expect(handleSetValue).toHaveBeenCalledWith(Number(-250));
  });

  test('shows integer error when value changed to decimal', async () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <RotationMeasureField value={0} setValue={handleSetValue} />
      </StoreProvider>
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 1.5 } });
    fireEvent.blur(input);
    expect(handleSetValue).toHaveBeenCalledWith(Number(1.5));
    expect(screen.getByText('rotationMeasure.error.integer')).toBeInTheDocument();
  });

  test('renders fixed disabled units dropdown', async () => {
    render(
      <StoreProvider>
        <RotationMeasureField value={0} setValue={vi.fn()} />
      </StoreProvider>
    );
    const units = screen.getByTestId('rotationMeasureUnits');
    expect(units).toHaveTextContent('rotationMeasure.units');
    const fieldRoot = within(units.parentElement as HTMLElement).getByRole('combobox');
    expect(fieldRoot).toHaveAttribute('aria-disabled', 'true');
  });
});
