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
  const valueRef = React.useRef(value);

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

  const handleChange = (input: number | string) => {
    setLocalValue(String(input));
  };

  const isEquivalentNumericString = (num: number, targetValue: number) =>
    Number.isFinite(num) && num === targetValue;

  React.useEffect(() => {
    const num = toNumber(localValue);
    const error = runValidation(num);
    const isEquivalent = isEquivalentNumericString(num, valueRef.current);
    setErrorText(error);
    if (!error && !isEquivalent) {
      onCommit(num);
    }
  }, [
    localValue,
    onCommit,
    validate,
    requiredMessage,
    rangeMessage,
    minValue,
    maxValue,
    minInclusive,
    maxInclusive
  ]);

  React.useEffect(() => {
    valueRef.current = value;
    const nextValue = String(value);
    setLocalValue((current) => {
      const currentAsNumber = toNumber(current);
      const isEquivalent = isEquivalentNumericString(currentAsNumber, value);
      return current === nextValue || isEquivalent ? current : nextValue;
    });
    setErrorText(runValidation(value));
  }, [
    value,
    validate,
    requiredMessage,
    rangeMessage,
    minValue,
    maxValue,
    minInclusive,
    maxInclusive
  ]);

  return { localValue, errorText, handleChange };
};
