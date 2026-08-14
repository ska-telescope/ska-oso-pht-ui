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
  setValue: (num: number) => void,
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
  const formatFiniteValue = (num: number) => (Number.isFinite(num) ? String(num) : null);
  const [text, setText] = React.useState<string>(formatFiniteValue(value) ?? '');
  const [error, setError] = React.useState('');
  const valueRef = React.useRef(value);
  const textRef = React.useRef(text);

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
    setText(String(input));
  };

  const isEquivalentValue = (num: number, targetValue: number) =>
    (Number.isFinite(num) && num === targetValue) ||
    (!Number.isFinite(num) && !Number.isFinite(targetValue));

  React.useEffect(() => {
    const number = toNumber(text);
    setError(runValidation(number));
    if (textRef.current === text) return;
    textRef.current = text;
    if (!isEquivalentValue(number, valueRef.current)) {
      setValue(number);
    }
  }, [
    text,
    setValue,
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
    const nextText = formatFiniteValue(value);
    if (nextText !== null) {
      setText((current) => {
        const currentAsNumber = toNumber(current);
        const isEquivalent = isEquivalentValue(currentAsNumber, value);
        return current === nextText || isEquivalent ? current : nextText;
      });
    }
    const nextError = runValidation(value);
    setError(nextError);
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

  return { text, error, handleChange };
};
