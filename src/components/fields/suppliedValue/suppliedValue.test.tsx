// SuppliedValue.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SuppliedValue from './suppliedValue';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('@ska-telescope/ska-gui-components', () => ({
  LABEL_POSITION: {
    CONTAINED: 'contained',
    START: 'start',
    TOP: 'top',
    BOTTOM: 'bottom',
    END: 'end'
  },
  TELESCOPE_MID: 'MID',
  TELESCOPE_LOW: 'LOW',
  NumberEntry: ({ errorText, value, setValue, onFocus, onBlur, testId }: any) => (
    <div>
      <input
        data-testid={testId}
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {errorText && <span data-testid="error">{errorText}</span>}
    </div>
  )
}));

const setHelpMock = vi.fn();
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({
    setHelp: setHelpMock
  })
}));

describe('SuppliedValue component', () => {
  it('renders with initial value', () => {
    render(<SuppliedValue value={5} setValue={vi.fn()} />);
  });

  it('shows minError when value is <= zero and only a minValue is supplied', () => {
    render(<SuppliedValue value={5} setValue={vi.fn()} minValue={0.001} />);
    fireEvent.change(screen.getByTestId('suppliedValue'), { target: { value: '0' } });
    expect(screen.getByTestId('error')).toHaveTextContent('suppliedValue.range.minError');
    fireEvent.change(screen.getByTestId('suppliedValue'), { target: { value: '-1' } });
    expect(screen.getByTestId('error')).toHaveTextContent('suppliedValue.range.minError');
  });

  it('does not show error when value is within range', () => {
    render(<SuppliedValue value={1} setValue={vi.fn()} minValue={0.001} maxValue={14400} />);
    fireEvent.change(screen.getByTestId('suppliedValue'), { target: { value: '3600' } });
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('shows maxError when value is >= maxValue and only a maxValue is supplied', () => {
    render(<SuppliedValue value={1} setValue={vi.fn()} maxValue={14400} currentUnitLabel="s" />);
    fireEvent.change(screen.getByTestId('suppliedValue'), { target: { value: '14401' } });
    expect(screen.getByTestId('error')).toHaveTextContent('suppliedValue.range.maxError');
  });

  it('shows error on invalid input, clears on valid input, and only commits to parent on blur', () => {
    const mockSetValue = vi.fn();
    render(<SuppliedValue value={1} setValue={mockSetValue} minValue={0} maxValue={14400} currentUnitLabel="h" />);
    const input = screen.getByTestId('suppliedValue');

    fireEvent.change(input, { target: { value: '0' } });
    expect(screen.getByTestId('error')).toHaveTextContent('suppliedValue.range.error');
    expect(mockSetValue).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '0.5' } });
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    expect(mockSetValue).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(mockSetValue).toHaveBeenCalledWith(0.5);
  });

  it('shows a range error if value is outside the specified range', () => {
    render(<SuppliedValue value={1} setValue={vi.fn()} minValue={0}maxValue={14400} currentUnitLabel="s" />);
    fireEvent.change(screen.getByTestId('suppliedValue'), { target: { value: '14401' } });
    expect(screen.getByTestId('error')).toHaveTextContent('suppliedValue.range.error');
  });

});
