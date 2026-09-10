import { describe, test, vi, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ImageSize from './imageSize';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (k: string) => k })
}));

describe('<ImageSize />', () => {
  test('updates correctly when value changed', () => {
    const handleSetValue = vi.fn();
    render(
      <StoreProvider>
        <ImageSize value={1} setValue={handleSetValue} />
      </StoreProvider>
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: 250 } });
    expect(handleSetValue).toHaveBeenCalledWith(250);
  });

  test('shows an error when value is not greater than zero', () => {
    render(
      <StoreProvider>
        <ImageSize value={1} setValue={vi.fn()} />
      </StoreProvider>
    );
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: 0 } });
    fireEvent.blur(input);
    expect(screen.getByText('imageSize.error')).toBeInTheDocument();
  });

  test('renders the image size units dropdown', () => {
    render(
      <StoreProvider>
        <ImageSize value={1} units={1} setUnits={vi.fn()} />
      </StoreProvider>
    );
    const units = screen.getByTestId('imageSizeUnits');
    expect(units).toHaveTextContent('imageSize.1');
    expect(within(units.parentElement as HTMLElement).getByRole('combobox')).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  test('disables both controls in read-only mode', () => {
    render(
      <StoreProvider>
        <ImageSize value={1} units={1} disabled />
      </StoreProvider>
    );
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    const units = screen.getByTestId('imageSizeUnits');
    expect(within(units.parentElement as HTMLElement).getByRole('combobox')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
