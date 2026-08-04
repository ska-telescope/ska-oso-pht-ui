import React from 'react';

interface NumericInputOptions {
  validate?: (num: number) => string;
  requiredMessage?: string;
  rangeMessage?: string;
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
    rangeMessage = 'out of range',
    minValue,
    maxValue,
    minInclusive = true,
    maxInclusive = true
  }: NumericInputOptions = {}
) => {
  const [localValue, setLocalValue] = React.useState<string>(String(value));
  const [errorText, setErrorText] = React.useState('');
  const errorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const belowMin = minValue !== undefined && (minInclusive ? num < minValue : num <= minValue);
    const aboveMax = maxValue !== undefined && (maxInclusive ? num > maxValue : num >= maxValue);
    if (belowMin || aboveMax) return rangeMessage;
    return validate ? validate(num) : '';
  };

  React.useEffect(() => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setLocalValue(String(value));
    setErrorText(runValidation(value));
  }, [value]);

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

  return { localValue, errorText, handleChange };
};
