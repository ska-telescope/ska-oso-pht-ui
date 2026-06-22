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
  NumberEntry: ({ errorText, value, setValue, onFocus, onBlur, onKeyDown, testId }: any) => (
    <div>
      <input
        data-testid={testId}
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
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

  it('does not show error immediately when typing an invalid value', () => {
    render(<SuppliedValue value={5} setValue={vi.fn()} minValue={0} />);
    const input = screen.getByTestId('suppliedValue');
    fireEvent.change(input, { target: { value: '0' } });
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    fireEvent.blur(input);
    expect(screen.getByTestId('error')).toHaveTextContent('suppliedValue.range.minError');
  });

  it('does not show error when value is within range', () => {
    render(<SuppliedValue value={1} setValue={vi.fn()} minValue={0} maxValue={14400} />);
    const input = screen.getByTestId('suppliedValue');
    fireEvent.keyDown(input, { key: '3' });
    fireEvent.change(input, { target: { value: '3600' } });
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('shows error on blur regardless of how the value was changed', () => {
    render(<SuppliedValue value={1} setValue={vi.fn()} maxValue={14400} currentUnitLabel="s" />);
    const input = screen.getByTestId('suppliedValue');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.change(input, { target: { value: '14401' } });
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    fireEvent.blur(input);
    expect(screen.getByTestId('error')).toHaveTextContent('suppliedValue.range.maxError');
  });

  it('does not commit value to parent until blur, and does not commit if invalid on blur', () => {
    const mockSetValue = vi.fn();
    render(<SuppliedValue value={1} setValue={mockSetValue} minValue={0} maxValue={14400} currentUnitLabel="h" />);
    const input = screen.getByTestId('suppliedValue');

    fireEvent.keyDown(input, { key: '0' });
    fireEvent.change(input, { target: { value: '0' } });
    expect(mockSetValue).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: '.' });
    fireEvent.change(input, { target: { value: '0.5' } });
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    expect(mockSetValue).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(mockSetValue).toHaveBeenCalledWith(0.5);
  });

  it('shows between-range error on blur when both min and max are set', () => {
    render(<SuppliedValue value={1} setValue={vi.fn()} minValue={0} maxValue={14400} currentUnitLabel="s" />);
    const input = screen.getByTestId('suppliedValue');
    fireEvent.change(input, { target: { value: '14401' } });
    fireEvent.blur(input);
    expect(screen.getByTestId('error')).toHaveTextContent('suppliedValue.range.error');
  });
});
