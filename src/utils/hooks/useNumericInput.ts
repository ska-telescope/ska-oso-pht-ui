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

  const runValidation = (num: number): string => {
    if (isNaN(num)) return requiredMessage;
    return validate ? validate(num) : '';
  };

  React.useEffect(() => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setLocalValue(value);
    setErrorText(runValidation(value));
  }, [value]);

  React.useEffect(() => {
    if (inputRef.current && step !== undefined) {
      inputRef.current.step = String(step);
      inputRef.current.min = minValue !== undefined ? String(minValue + step) : '';
      inputRef.current.max = maxValue !== undefined ? String(maxValue) : '';
    }
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorText(runValidation(localValue));
    return () => { if (errorTimerRef.current) clearTimeout(errorTimerRef.current); };
  }, [step, minValue, maxValue]); // eslint-disable-line react-hooks/exhaustive-deps

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
