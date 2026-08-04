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
    rangeMessage: t(`${FIELD}.range.error`, {
      min: minValue,
      max: maxValue,
      units: currentUnitLabel
    }),
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
