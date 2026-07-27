import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Robust from './Robust';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (k: string) => k })
}));

describe('<Robust /> behavior', () => {
  test('renders robust as a free-text input', () => {
    render(<Robust label="Robust" value={0} />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  test('commits parsed decimal value on blur when input is valid', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = screen.getByRole('spinbutton');
    fireEvent.change(field, { target: { value: '1.5' } });
    fireEvent.blur(field);

    expect(setValue).toHaveBeenCalledWith(1.5);
  });

  test('does not commit intermediate valid value before blur', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } });

    expect(setValue).not.toHaveBeenCalled();
  });

  test('preserves typed decimal precision when committed', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = screen.getByRole('spinbutton');
    fireEvent.change(field, { target: { value: '1.45' } });
    fireEvent.blur(field);

    expect(setValue).toHaveBeenCalledWith(1.45);
  });

  test('rejects scientific notation input and shows an error', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = screen.getByRole('spinbutton');
    fireEvent.change(field, { target: { value: '1e-1' } });
    fireEvent.blur(field);

    expect(setValue).not.toHaveBeenCalled();
    expect(screen.getByText('robust.error')).toBeInTheDocument();
  });

  test('rejects values outside [-2, 2] and shows an error', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = screen.getByRole('spinbutton');
    fireEvent.change(field, { target: { value: '2.1' } });
    fireEvent.blur(field);

    expect(setValue).not.toHaveBeenCalled();
    expect(screen.getByText('robust.error')).toBeInTheDocument();
  });
});
