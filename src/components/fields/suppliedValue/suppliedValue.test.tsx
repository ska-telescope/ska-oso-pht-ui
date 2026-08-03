// SuppliedValue.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SuppliedValue from './suppliedValue';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key
  })
}));

const setHelpMock = vi.fn();
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({
    setHelp: setHelpMock
  })
}));

describe('SuppliedValue component', () => {
  const TEST_LABEL = 'Supplied value (test)';
  const getField = () => screen.getByLabelText(TEST_LABEL);

  it('renders with initial value', () => {
    render(<SuppliedValue label={TEST_LABEL} value={5} setValue={vi.fn()} />);
    expect(getField()).toBeInTheDocument();
  });

  it('shows error when typing an invalid value', () => {
    render(<SuppliedValue label={TEST_LABEL} value={5} setValue={vi.fn()} minValue={0} />);
    const input = getField();
    fireEvent.change(input, { target: { value: '0' } });
    expect(screen.getByText('suppliedValue.range.minError')).toBeInTheDocument();
  });

  it('does not show error when value is within range', () => {
    render(
      <SuppliedValue
        label={TEST_LABEL}
        value={1}
        setValue={vi.fn()}
        minValue={0}
        maxValue={14400}
      />
    );
    const input = getField();
    fireEvent.keyDown(input, { key: '3' });
    fireEvent.change(input, { target: { value: '3600' } });
    expect(screen.queryByText('suppliedValue.range.error')).not.toBeInTheDocument();
    expect(screen.queryByText('suppliedValue.range.minError')).not.toBeInTheDocument();
  });

  it('commits step-incremented value immediately after ArrowUp change', () => {
    const mockSetValue = vi.fn();
    render(
      <SuppliedValue
        label={TEST_LABEL}
        value={1200}
        setValue={mockSetValue}
        minValue={0}
        maxValue={14400}
        step={600}
      />
    );
    const input = getField();

    // Simulate native browser ArrowUp: fires onChange with value incremented by step (1200 + 600 = 1800)
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.change(input, { target: { value: '1800' } });
    expect(mockSetValue).toHaveBeenCalledWith(1800);
    expect(screen.queryByText('suppliedValue.range.error')).not.toBeInTheDocument();
    expect(screen.queryByText('suppliedValue.range.minError')).not.toBeInTheDocument();
  });

  it('shows error when ArrowDown steps value to or below minimum', () => {
    render(
      <SuppliedValue
        label={TEST_LABEL}
        value={1800}
        setValue={vi.fn()}
        minValue={1200}
        step={600}
      />
    );
    const input = getField();

    // Simulate native browser ArrowDown: fires onChange with value decremented by step (1800 - 600 = 1200)
    // 1200 <= minValue(1200) so this is invalid
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.change(input, { target: { value: '1200' } });
    expect(screen.getByText('suppliedValue.range.minError')).toBeInTheDocument();
  });

  it('commits value to parent immediately when it becomes valid', () => {
    const mockSetValue = vi.fn();
    render(
      <SuppliedValue
        label={TEST_LABEL}
        value={1}
        setValue={mockSetValue}
        minValue={0}
        maxValue={14400}
        currentUnitLabel="h"
      />
    );
    const input = getField();

    fireEvent.keyDown(input, { key: '0' });
    fireEvent.change(input, { target: { value: '0' } });
    expect(mockSetValue).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: '.' });
    fireEvent.change(input, { target: { value: '0.5' } });
    expect(screen.queryByText('suppliedValue.range.error')).not.toBeInTheDocument();
    expect(screen.queryByText('suppliedValue.range.minError')).not.toBeInTheDocument();
    expect(mockSetValue).toHaveBeenCalledWith(0.5);
  });

  it('shows between-range error when both min and max are set', () => {
    render(
      <SuppliedValue
        label={TEST_LABEL}
        value={1}
        setValue={vi.fn()}
        minValue={0}
        maxValue={14400}
        currentUnitLabel="s"
      />
    );
    const input = getField();
    fireEvent.change(input, { target: { value: '14401' } });
    expect(screen.getByText('suppliedValue.range.error')).toBeInTheDocument();
  });
});
