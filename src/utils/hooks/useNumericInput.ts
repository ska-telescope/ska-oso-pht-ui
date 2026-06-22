import React from 'react';

interface NumericInputOptions {
  validate?: (num: number) => string;
  requiredMessage?: string;
  commitOnBlur?: boolean;
  errorDelayMs?: number;
  step?: number;
  minValue?: number;
  maxValue?: number;
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
    maxValue
  }: NumericInputOptions = {}
) => {
  const [localValue, setLocalValue] = React.useState<number>(value);
  const [errorText, setErrorText] = React.useState('');
  const errorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!inputRef.current || step === undefined) return;
    inputRef.current.step = String(step);
    inputRef.current.min = minValue !== undefined ? String(minValue + step) : '';
    inputRef.current.max = maxValue !== undefined ? String(maxValue) : '';
  }, [step, minValue, maxValue]);

  React.useEffect(() => {
    return () => { if (errorTimerRef.current) clearTimeout(errorTimerRef.current); };
  }, []);

  const runValidation = (num: number): string => {
    if (isNaN(num)) return requiredMessage;
    return validate ? validate(num) : '';
  };

  React.useEffect(() => {
    setLocalValue(value);
    setErrorText(runValidation(value));
  }, [value]);

  const handleChange = (input: number) => {
    setLocalValue(input);
    const error = runValidation(input);
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
    if (!error && !commitOnBlur) onCommit(input);
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
