import React from 'react';

interface NumericInputOptions {
  validate?: (num: number) => string;
  requiredMessage?: string;
  commitOnBlur?: boolean;
  errorDelayMs?: number;
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
    commitOnBlur = false,
    errorDelayMs,
    step,
    minValue,
    maxValue,
    minInclusive = true,
    maxInclusive = true
  }: NumericInputOptions = {}
) => {
  const [localValue, setLocalValue] = React.useState<number>(value);
  const [errorText, setErrorText] = React.useState('');
  const errorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const runValidation = (num: number): string => {
    if (isNaN(num)) return requiredMessage;
    return validate ? validate(num) : '';
  };

  React.useEffect(() => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setLocalValue(value);
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
    setErrorText(runValidation(localValue));
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [step, minValue, maxValue, minInclusive, maxInclusive]);

  const handleChange = (input: number) => {
    const num = Number(input);
    setLocalValue(num);
    const error = runValidation(num);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (error) {
      if (!errorDelayMs) {
        setErrorText(error);
      } else {
        errorTimerRef.current = setTimeout(() => setErrorText(error), errorDelayMs);
      }
    } else {
      setErrorText('');
    }
    if (!error && !commitOnBlur) onCommit(num);
  };

  const handleBlur = commitOnBlur
    ? () => {
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        const error = runValidation(localValue);
        setErrorText(error);
        if (!error) onCommit(localValue);
      }
    : undefined;

  return { localValue, errorText, handleChange, handleBlur, inputRef };
};
