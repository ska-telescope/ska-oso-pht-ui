import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Robust from './Robust';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (k: string) => k })
}));

describe('<Robust /> behavior', () => {
  const getField = () => screen.getByRole('spinbutton');
  const spinAndBlur = (direction: 'ArrowUp' | 'ArrowDown', nextValue: string) => {
    const field = getField();
    fireEvent.keyDown(field, { key: direction });
    fireEvent.change(field, { target: { value: nextValue } });
    fireEvent.blur(field);
  };

  test('renders robust NumberEntry input', () => {
    render(<Robust label="Robust" value={0} />);
    expect(getField()).toBeInTheDocument();
  });

  test('commits parsed decimal value on blur when input is valid', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = getField();
    fireEvent.change(field, { target: { value: '1.5' } });
    fireEvent.blur(field);

    expect(setValue).toHaveBeenCalledWith(1.5);
  });

  test('does not commit intermediate valid value before blur', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    fireEvent.change(getField(), { target: { value: '1' } });

    expect(setValue).not.toHaveBeenCalled();
  });

  test('preserves typed decimal precision when committed', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = getField();
    fireEvent.change(field, { target: { value: '1.45' } });
    fireEvent.blur(field);

    expect(setValue).toHaveBeenCalledWith(1.45);
  });

  test('rejects values below range and shows an error', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = getField();
    fireEvent.change(field, { target: { value: '-2.1' } });
    fireEvent.blur(field);

    expect(setValue).not.toHaveBeenCalled();
    expect(screen.getByText('robust.error')).toBeInTheDocument();
  });

  test('rejects values outside [-2, 2] and shows an error', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={0} setValue={setValue} />);

    const field = getField();
    fireEvent.change(field, { target: { value: '2.1' } });
    fireEvent.blur(field);

    expect(setValue).not.toHaveBeenCalled();
    expect(screen.getByText('robust.error')).toBeInTheDocument();
  });

  test('spinner up increments from 1 to 1.1', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={1} setValue={setValue} />);

    spinAndBlur('ArrowUp', '1.1');

    expect(setValue).toHaveBeenCalledWith(1.1);
  });

  test('spinner down decrements from 1 to 0.9', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={1} setValue={setValue} />);

    spinAndBlur('ArrowDown', '0.9');

    expect(setValue).toHaveBeenCalledWith(0.9);
  });

  test('spinner up at upper bound keeps value at 2 with no error', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={2} setValue={setValue} />);

    spinAndBlur('ArrowUp', '2');

    expect(setValue).toHaveBeenCalledWith(2);
    expect(screen.queryByText('robust.error')).not.toBeInTheDocument();
  });

  test('spinner down at lower bound keeps value at -2 with no error', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={-2} setValue={setValue} />);

    spinAndBlur('ArrowDown', '-2');

    expect(setValue).toHaveBeenCalledWith(-2);
    expect(screen.queryByText('robust.error')).not.toBeInTheDocument();
  });

  test('spinner up from 1.45 snaps to 1.5', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={1.45} setValue={setValue} />);

    spinAndBlur('ArrowUp', '1.5');

    expect(setValue).toHaveBeenCalledWith(1.5);
  });

  test('spinner down from 1.45 snaps to 1.4', () => {
    const setValue = vi.fn();
    render(<Robust label="Robust" value={1.45} setValue={setValue} />);

    spinAndBlur('ArrowDown', '1.4');

    expect(setValue).toHaveBeenCalledWith(1.4);
  });
});
