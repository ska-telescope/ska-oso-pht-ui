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

  it('commits step-incremented value on blur after ArrowUp; no commit or error during edit', () => {
    const mockSetValue = vi.fn();
    render(<SuppliedValue value={1200} setValue={mockSetValue} minValue={0} maxValue={14400} step={600} />);
    const input = screen.getByTestId('suppliedValue');

    // Simulate native browser ArrowUp: fires onChange with value incremented by step (1200 + 600 = 1800)
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.change(input, { target: { value: '1800' } });
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    fireEvent.blur(input);
    expect(mockSetValue).toHaveBeenCalledWith(1800);
  });

  it('shows error on blur when ArrowDown steps value to or below minimum', () => {
    render(<SuppliedValue value={1800} setValue={vi.fn()} minValue={1200} step={600} />);
    const input = screen.getByTestId('suppliedValue');

    // Simulate native browser ArrowDown: fires onChange with value decremented by step (1800 - 600 = 1200)
    // 1200 <= minValue(1200) so this is invalid
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.change(input, { target: { value: '1200' } });
    expect(screen.queryByTestId('error')).not.toBeInTheDocument(); // error is delayed until blur

    fireEvent.blur(input);
    expect(screen.getByTestId('error')).toHaveTextContent('suppliedValue.range.minError');
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
