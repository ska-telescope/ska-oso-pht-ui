import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useNumericInput } from './useNumericInput';

type HookConfig = {
  value: number;
  requiredMessage: string;
  rangeMessage: string;
  minValue: number;
  maxValue: number;
  minInclusive: boolean;
  maxInclusive: boolean;
};

const testConfig: HookConfig = {
  value: 2,
  requiredMessage: 'required',
  rangeMessage: 'range',
  minValue: 0,
  maxValue: 5,
  minInclusive: true,
  maxInclusive: true
};

const renderNumericHook = () => {
  const setValue = vi.fn();
  const hook = renderHook(
    ({
      value,
      requiredMessage,
      rangeMessage,
      minValue,
      maxValue,
      minInclusive,
      maxInclusive
    }: HookConfig) =>
      useNumericInput(value, setValue, {
        requiredMessage,
        rangeMessage,
        minValue,
        maxValue,
        minInclusive,
        maxInclusive
      }),
    {
      initialProps: testConfig
    }
  );
  return { ...hook, setValue };
};

describe('useNumericInput', () => {
  test('initialises text from value with no error for valid number', () => {
    const { result, setValue } = renderNumericHook();

    expect(result.current.text).toBe('2');
    expect(result.current.error).toBe('');
    expect(setValue).not.toHaveBeenCalled();
  });

  test('commits parseable valid number and clears error', () => {
    const { result, setValue } = renderNumericHook();

    act(() => result.current.handleChange('4'));

    expect(setValue).toHaveBeenCalledWith(4);
    expect(result.current.text).toBe('4');
    expect(result.current.error).toBe('');
  });

  test('commits parseable out-of-range number and sets range error', () => {
    const { result, setValue } = renderNumericHook();

    act(() => result.current.handleChange('11'));

    expect(setValue).toHaveBeenCalledWith(11);
    expect(result.current.text).toBe('11');
    expect(result.current.error).toBe('range');
  });

  test('commits NaN for empty string and sets required error', () => {
    const { result, setValue } = renderNumericHook();

    act(() => result.current.handleChange(''));

    expect(setValue).toHaveBeenCalledWith(NaN);
    expect(result.current.text).toBe('');
    expect(result.current.error).toBe('required');
  });

  test('commits NaN for non-parseable draft and sets required error', () => {
    const { result, setValue } = renderNumericHook();

    act(() => result.current.handleChange('-'));

    expect(setValue).toHaveBeenCalledWith(NaN);
    expect(result.current.text).toBe('-');
    expect(result.current.error).toBe('required');
  });

  test('preserves transient invalid text when parent value becomes NaN', () => {
    const { result, rerender } = renderNumericHook();

    act(() => result.current.handleChange('-'));
    expect(result.current.text).toBe('-');
    expect(result.current.error).toBe('required');

    rerender({ ...testConfig, value: Number.NaN });
    expect(result.current.text).toBe('-');
    expect(result.current.error).toBe('required');
  });

  test('syncs text from external value changes', () => {
    const { result, rerender } = renderNumericHook();

    expect(result.current.text).toBe('2');

    rerender({ ...testConfig, value: 4 });
    expect(result.current.text).toBe('4');
    expect(result.current.error).toBe('');
  });

  test('preserves equivalent text representation when parent value updates to same number', () => {
    const { result, rerender, setValue } = renderNumericHook();

    act(() => result.current.handleChange('1.'));
    expect(setValue).toHaveBeenCalledWith(1);

    rerender({ ...testConfig, value: 1 });
    expect(result.current.text).toBe('1.');
    expect(result.current.error).toBe('');
  });

  test('does not commit when changed text is numerically equivalent to current value', () => {
    const { result, setValue } = renderNumericHook();

    act(() => result.current.handleChange('2.0'));

    expect(setValue).not.toHaveBeenCalled();
    expect(result.current.text).toBe('2.0');
    expect(result.current.error).toBe('');
  });

  test('recomputes error on validation-rule changes without committing when text is unchanged', () => {
    const { result, rerender, setValue } = renderNumericHook();

    expect(result.current.error).toBe('');

    rerender({ ...testConfig, maxValue: 1 });

    expect(result.current.text).toBe('2');
    expect(result.current.error).toBe('range');
    expect(setValue).not.toHaveBeenCalled();
  });

  test('treats boundary values as valid when bounds are inclusive', () => {
    const { result } = renderNumericHook();

    act(() => result.current.handleChange('0'));
    expect(result.current.error).toBe('');

    act(() => result.current.handleChange('5'));
    expect(result.current.error).toBe('');
  });

  test('treats boundary values as invalid when bounds are exclusive', () => {
    const { result, rerender } = renderNumericHook();

    rerender({ ...testConfig, minInclusive: false, maxInclusive: false });

    act(() => result.current.handleChange('0'));
    expect(result.current.error).toBe('range');

    act(() => result.current.handleChange('5'));
    expect(result.current.error).toBe('range');
  });

  test('supports integer-only validation via validate callback', () => {
    const setValue = vi.fn();
    const integerError = 'integerOnly';
    const validateInteger = (num: number) => (Number.isInteger(num) ? '' : integerError);
    const { result } = renderHook(
      (config: HookConfig) =>
        useNumericInput(config.value, setValue, {
          requiredMessage: config.requiredMessage,
          rangeMessage: config.rangeMessage,
          minValue: config.minValue,
          maxValue: config.maxValue,
          minInclusive: config.minInclusive,
          maxInclusive: config.maxInclusive,
          validate: validateInteger
        }),
      { initialProps: testConfig }
    );

    act(() => result.current.handleChange('3.5'));
    expect(result.current.error).toBe(integerError);
    expect(setValue).toHaveBeenCalledWith(3.5);

    act(() => result.current.handleChange('3'));
    expect(result.current.error).toBe('');
    expect(setValue).toHaveBeenCalledWith(3);
  });
});
