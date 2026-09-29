import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Robust from './Robust';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (k: string) => k })
}));

describe('<Robust /> behavior', () => {
  const noop = () => undefined;
  const getField = () => screen.getByRole('textbox');

  test('renders robust numeric input', () => {
    render(<Robust label="Robust" value={0} setValue={noop} />);
    expect(getField()).toBeInTheDocument();
  });

  test('renders without a units dropdown', () => {
    render(<Robust label="Robust" value={0} setValue={noop} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  test('commits parsed decimal value when input is valid', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = getField();
    fireEvent.change(field, { target: { value: '1.5' } });

    expect(setValue).toHaveBeenCalledWith(1.5);
  });

  test('commits values outside [-2, 2] and shows an error', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = getField();
    fireEvent.change(field, { target: { value: '2.1' } });

    expect(setValue).toHaveBeenCalledWith(2.1);
    expect(screen.getByText('robust.error')).toBeInTheDocument();
  });

  test('commits NaN for non-parseable draft and shows an error', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={1} setValue={setValue} />);

    fireEvent.change(getField(), { target: { value: '-' } });

    expect(setValue).toHaveBeenCalledWith(NaN);
    expect(screen.getByText('robust.error')).toBeInTheDocument();
  });
});
