import { Grid, TextField } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useNumericInput } from '@/utils/hooks/useNumericInput';

interface RobustFieldProps {
  disabled?: boolean;
  onFocus?: () => void;
  label: string;
  required?: boolean;
  commitOnBlur?: boolean;
  setValue: (nextValue: number) => void;
  suffix?: React.ReactNode;
  value: number;
  widthButton?: number;
}

const ROBUST_RANGE = { min: -2, max: 2 };
const ROBUST_STEP = 0.1;

export default function RobustField({
  disabled = false,
  onFocus = undefined,
  label,
  commitOnBlur = true,
  setValue,
  suffix = null,
  value,
  widthButton = 0
}: RobustFieldProps) {
  const { t } = useScopedTranslation();
  const { localValue, errorText, handleChange, handleBlur, inputRef } = useNumericInput(
    value,
    setValue,
    {
      requiredMessage: t('robust.error'),
      validate: (num) =>
        num < ROBUST_RANGE.min || num > ROBUST_RANGE.max ? t('robust.error') : '',
      commitOnBlur,
      step: ROBUST_STEP,
      minValue: ROBUST_RANGE.min,
      maxValue: ROBUST_RANGE.max
    }
  );
  const error = !!errorText;

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
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
          onBlur={handleBlur}
          onFocus={onFocus}
          slotProps={{
            htmlInput: {
              min: ROBUST_RANGE.min,
              max: ROBUST_RANGE.max,
              step: ROBUST_STEP
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
