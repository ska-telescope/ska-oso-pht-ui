import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { useNumericInput } from '@/utils/hooks/useNumericInput';
import { TextField } from '@mui/material';

interface SuppliedValueProps {
  disabled?: boolean;
  required?: boolean;
  label?: string;
  setValue: (num: number) => void;
  value: number;
  minValue?: number;
  maxValue?: number;
  currentUnitLabel?: string;
  step?: number;
}

export default function SuppliedValue({
  disabled = false,
  label = '',
  setValue,
  value,
  minValue,
  maxValue,
  currentUnitLabel,
  step
}: SuppliedValueProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'suppliedValue';

  const { localValue, errorText, handleChange, inputRef } = useNumericInput(value, setValue, {
    requiredMessage: t(`${FIELD}.required`),
    validate: (num) => {
      const belowMin = minValue !== undefined && num <= minValue;
      const aboveMax = maxValue !== undefined && num > maxValue;
      if (!belowMin && !aboveMax) return '';

      // Note explicitily here we only have two scenarios,
      // - For Integration Time we have a min and max so range error is used
      // - for Sensitivity we only have a min value so min error is used.
      // (point being we don't have a scenario where we only have a max value set).
      if (minValue !== undefined && maxValue !== undefined)
        return t(`${FIELD}.range.error`, {
          min: minValue,
          max: maxValue,
          units: currentUnitLabel
        });
      return t(`${FIELD}.range.minError`, { min: minValue, units: currentUnitLabel });
    },
    step,
    minValue,
    maxValue,
    minInclusive: false
  });

  const error = !!errorText;

  return (
    <TextField
      variant="standard"
      type="number"
      fullWidth
      disabled={disabled}
      helperText={errorText}
      label={label}
      value={localValue}
      error={error}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={() => setHelp(FIELD)}
      slotProps={{
        htmlInput: {
          min: minValue,
          max: maxValue,
          step: step
        }
      }}
    />
  );
}
