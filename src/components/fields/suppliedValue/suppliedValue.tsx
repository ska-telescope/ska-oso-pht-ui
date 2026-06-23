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

  const { localValue, errorText, handleChange, handleBlur, inputRef } = useNumericInput(
    value,
    setValue,
    {
      requiredMessage: t(`${FIELD}.required`),
      validate: num => {
        const belowMin = minValue !== undefined && num <= minValue;
        const aboveMax = maxValue !== undefined && num > maxValue;
        if (!belowMin && !aboveMax) return '';

        // Note explicitily here we only have two scenarios, 
        // - For Integration Time we have a min and max so range error is used 
        // - for Sensitivity we only have a min value so min error is used. 
        // (point being we don't have a scenario where we only have a max value set).
        if (minValue !== undefined && maxValue !== undefined)
          return t(`${FIELD}.range.error`, { min: minValue, max: maxValue, units: currentUnitLabel });
        return t(`${FIELD}.range.minError`, { min: minValue, units: currentUnitLabel });
      },
      commitOnBlur: true,
      errorDelayMs: ERROR_SECS,
      step,
      minValue,
      maxValue
    }
  );

  return (
    <NumberEntry
      disabled={disabled}
      errorText={errorText}
      inputRef={inputRef}
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
