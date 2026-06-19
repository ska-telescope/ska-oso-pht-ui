import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { ERROR_SECS } from '@/utils/constants';

interface SuppliedValueProps {
  disabled?: boolean;
  required?: boolean;
  label?: string;
  setValue: Function;
  suffix?: any;
  value: number;
  minValue?: number;
  maxValue?: number;
  currentUnitLabel?: string;
  step?: number;
}

export default function SuppliedValue({
  disabled = false,
  required = false,
  label = '',
  setValue,
  suffix,
  value,
  minValue,
  maxValue,
  currentUnitLabel,
  step,
}: SuppliedValueProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'suppliedValue';
  const [errorKey, setErrorKey] = React.useState<string | null>(null);
  const [localValue, setLocalValue] = React.useState<number>(value);
  const errorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = React.useRef(false);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getErrorKey = (num: number): string | null => {
    const belowMin = minValue !== undefined && num <= minValue;
    const aboveMax = maxValue !== undefined && num > maxValue;
    if (!belowMin && !aboveMax) return null;
    if (minValue !== undefined && maxValue !== undefined) return 'range.error';
    if (belowMin) return 'range.minError';
    return 'range.maxError';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    isTypingRef.current = e.key !== 'ArrowUp' && e.key !== 'ArrowDown';
  };

  const handleChange = (e: number) => {
    const num = Number(e);
    setLocalValue(num);
    const key = getErrorKey(num);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (key) {
      if (isTypingRef.current) {
        setErrorKey(key);
      } else {
        errorTimerRef.current = setTimeout(() => setErrorKey(key), ERROR_SECS);
      }
    } else {
      setErrorKey(null);
    }
    isTypingRef.current = false;
  };

  const handleBlur = () => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    const key = getErrorKey(localValue);
    setErrorKey(key);
    if (!key) setValue(localValue);
  };

  const errorMessage = errorKey
    ? t(`${FIELD}.${errorKey}`, { min: minValue, max: maxValue, units: currentUnitLabel })
    : '';

  return (
    <NumberEntry
      disabled={disabled}
      errorText={errorMessage}
      label={label}
      required={required}
      testId={FIELD}
      value={localValue}
      setValue={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={() => setHelp(FIELD)}
      step={step}
      suffix={suffix}
    />
  );
}
