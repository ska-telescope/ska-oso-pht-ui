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
}: SuppliedValueProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'suppliedValue';
  const [errorKey, setErrorKey] = React.useState<string | null>(null);
  const [localValue, setLocalValue] = React.useState<number>(value);

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

  const handleChange = (e: number) => {
    const num = Number(e);
    setLocalValue(num);
    setErrorKey(getErrorKey(num));
  };

  const handleBlur = () => {
    if (!errorKey) setValue(localValue);
  };

  const errorMessage = errorKey
    ? t(`${FIELD}.${errorKey}`, { min: minValue, max: maxValue, units: currentUnitLabel })
    : '';

  React.useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setErrorKey(null);
      }, ERROR_SECS);
    };
    timer();
  }, [errorKey]);

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
      onFocus={() => setHelp(FIELD)}
      suffix={suffix}
    />
  );
}
