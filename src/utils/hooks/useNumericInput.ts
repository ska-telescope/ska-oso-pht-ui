import React from 'react';

interface NumericInputOptions {
  validate?: (num: number) => string;
  requiredMessage?: string;
  commitOnBlur?: boolean;
  errorDelayMs?: number;
}

export const useNumericInput = (
  value: number,
  onCommit: (num: number) => void,
  {
    validate,
    requiredMessage = 'required',
    commitOnBlur = false,
    errorDelayMs
  }: NumericInputOptions = {}
) => {
  const [localValue, setLocalValue] = React.useState<number>(value);
  const [errorText, setErrorText] = React.useState('');
  const errorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = React.useRef(false);

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
      if (!errorDelayMs || isTypingRef.current) {
        setErrorText(error);
      } else {
        errorTimerRef.current = setTimeout(() => setErrorText(error), errorDelayMs);
      }
    } else {
      setErrorText('');
    }
    isTypingRef.current = false;
    if (!error && !commitOnBlur) onCommit(input);
  };

  const handleKeyDown = errorDelayMs
    ? (e: React.KeyboardEvent) => {
        isTypingRef.current = e.key !== 'ArrowUp' && e.key !== 'ArrowDown';
      }
    : undefined;

  const handleBlur = commitOnBlur
    ? () => {
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        const error = runValidation(localValue);
        setErrorText(error);
        if (!error) onCommit(localValue);
      }
    : undefined;

  return { localValue, errorText, handleChange, handleKeyDown, handleBlur };
};
