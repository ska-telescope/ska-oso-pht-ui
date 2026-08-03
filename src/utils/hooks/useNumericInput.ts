import React from 'react';

interface NumericInputOptions {
  validate?: (num: number) => string;
  requiredMessage?: string;
  step?: number;
  minValue?: number;
  maxValue?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
}

export const useNumericInput = (
  value: number,
  onCommit: (num: number) => void,
  {
    validate,
    requiredMessage = 'required',
    step,
    minValue,
    maxValue,
    minInclusive = true,
    maxInclusive = true
  }: NumericInputOptions = {}
) => {
  const [localValue, setLocalValue] = React.useState<string>(String(value));
  const [errorText, setErrorText] = React.useState('');
  const errorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const toNumber = (input: string | number): number => {
    if (typeof input === 'number') {
      return Number.isFinite(input) ? input : NaN;
    }
    const trimmed = input.trim();
    // NaN is used as an internal invalid-parse marker
    // Empty/whitespace are handled explicitly because Number('') would otherwise coerce to 0.
    if (trimmed === '') {
      return NaN;
    }
    const number = Number(trimmed);
    return Number.isFinite(number) ? number : NaN;
  };

  const runValidation = (num: number): string => {
    if (!Number.isFinite(num)) return requiredMessage || 'required';
    return validate ? validate(num) : '';
  };

  React.useEffect(() => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setLocalValue(String(value));
    setErrorText(runValidation(value));
  }, [value]);

  const getInputMin = (): string => {
    if (minValue === undefined) return '';
    if (minInclusive || step === undefined) return String(minValue);
    return String(minValue + step);
  };

  const getInputMax = (): string => {
    if (maxValue === undefined) return '';
    if (maxInclusive || step === undefined) return String(maxValue);
    return String(maxValue - step);
  };

  React.useEffect(() => {
    if (inputRef.current && step !== undefined) {
      inputRef.current.step = String(step);
      inputRef.current.min = getInputMin();
      inputRef.current.max = getInputMax();
    }
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorText(runValidation(toNumber(localValue)));
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [step, minValue, maxValue, minInclusive, maxInclusive]);

  const handleChange = (input: number | string) => {
    const rawValue = String(input);
    const num = toNumber(rawValue);
    setLocalValue(rawValue);
    const error = runValidation(num);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (error) {
      setErrorText(error);
    } else {
      setErrorText('');
      onCommit(num);
    }
  };

  return { localValue, errorText, handleChange, inputRef };
};
