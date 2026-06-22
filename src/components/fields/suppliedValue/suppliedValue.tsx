import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { ERROR_SECS } from '@/utils/constants';
import { useNumericInput } from '@/utils/hooks/useNumericInput';

interface SuppliedValueProps {
  disabled?: boolean;
  required?: boolean;
  label?: string;
  setValue: (num: number) => void;
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
  step
}: SuppliedValueProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'suppliedValue';

  const { localValue, errorText, handleChange, handleKeyDown, handleBlur } = useNumericInput(
    value,
    setValue,
    {
      validate: num => {
        const belowMin = minValue !== undefined && num <= minValue;
        const aboveMax = maxValue !== undefined && num > maxValue;
        if (!belowMin && !aboveMax) return '';
        if (minValue !== undefined && maxValue !== undefined)
          return t(`${FIELD}.range.error`, { min: minValue, max: maxValue, units: currentUnitLabel });
        if (belowMin)
          return t(`${FIELD}.range.minError`, { min: minValue, units: currentUnitLabel });
        return t(`${FIELD}.range.maxError`, { max: maxValue, units: currentUnitLabel });
      },
      commitOnBlur: true,
      errorDelayMs: ERROR_SECS
    }
  );

  return (
    <NumberEntry
      disabled={disabled}
      errorText={errorText}
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
