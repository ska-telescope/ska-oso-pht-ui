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
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('passes parsed decimal value when input is valid', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1.5' } });

    expect(setValue).toHaveBeenCalledWith(1.5);
  });

  test('rejects scientific notation input and shows an error', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1e-1' } });

    expect(setValue).not.toHaveBeenCalled();
    expect(screen.getByText('robust.error')).toBeInTheDocument();
  });
});
