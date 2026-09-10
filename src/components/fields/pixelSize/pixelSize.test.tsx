import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PixelSizeField from '@components/fields/pixelSize/pixelSize.tsx';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (k: string) => k })
}));

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('PixelSizeField', () => {
  it('updates correctly when value changed', () => {
    const handleSetValue = vi.fn();
    wrapper(<PixelSizeField value={10} setValue={handleSetValue} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: 250 } });
    expect(handleSetValue).toHaveBeenCalledWith(250);
  });

  it('shows an error when value is not greater than zero', () => {
    wrapper(<PixelSizeField value={10} setValue={vi.fn()} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: 0 } });
    fireEvent.blur(input);
    expect(screen.getByText('pixelSize.error')).toBeInTheDocument();
  });

  it('renders the pixel size units dropdown', () => {
    wrapper(<PixelSizeField value={10} units={1} setUnits={vi.fn()} />);
    const units = screen.getByTestId('pixelSizeUnits');
    expect(units).toHaveTextContent('pixelSize.1');
    expect(within(units.parentElement as HTMLElement).getByRole('combobox')).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('disables both controls in read-only mode', () => {
    wrapper(<PixelSizeField value={10} units={1} disabled />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    const units = screen.getByTestId('pixelSizeUnits');
    expect(within(units.parentElement as HTMLElement).getByRole('combobox')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
