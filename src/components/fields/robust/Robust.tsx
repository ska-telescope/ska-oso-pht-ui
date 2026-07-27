import { Grid, InputAdornment, TextField } from '@mui/material';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface RobustFieldProps {
  disabled?: boolean;
  onFocus?: () => void;
  label: string;
  required?: boolean;
  setValue?: (nextValue: number) => void;
  suffix?: React.ReactNode;
  value: string | number;
  widthButton?: number;
}

const ROBUST_RANGE = { min: -2, max: 2 };
const ROBUST_STEP = 0.1;
const FIELD = 'robust';

const validateNumericText = (value: string, min: number, max: number): boolean => {
  const numericPattern = /^[-+]?(?:\d+\.?\d*|\.\d+)$/;
  if (!numericPattern.test(value)) {
    return false;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
};

const isValidRobustValue = (value: string) =>
  validateNumericText(value, ROBUST_RANGE.min, ROBUST_RANGE.max);

export default function RobustField({
  disabled = false,
  onFocus = undefined,
  label,
  required = false,
  setValue = undefined,
  suffix = null,
  value,
  widthButton = 0
}: RobustFieldProps) {
  const { t } = useScopedTranslation();
  const [inputValue, setInputValue] = React.useState(String(value ?? ''));

  React.useEffect(() => {
    const nextValue = String(value ?? '');
    setInputValue((previousValue) => (previousValue === nextValue ? previousValue : nextValue));
  }, [value]);

  const handleSetValue = (nextValue: string) => {
    setInputValue(nextValue);
    if (!isValidRobustValue(nextValue)) {
      return;
    }
    setValue?.(Number(nextValue));
  };

  const errorText =
    inputValue.length > 0 && !isValidRobustValue(inputValue) ? t('robust.error') : '';

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <TextField
          type="number"
          variant="standard"
          fullWidth
          disabled={disabled}
          error={!!errorText}
          helperText={errorText}
          required={required}
          value={inputValue}
          inputProps={{ 'data-testid': FIELD }}
          onChange={(event) => handleSetValue(event.target.value)}
          label={label}
          onFocus={onFocus}
          slotProps={{
            htmlInput: {
              step: ROBUST_STEP,
              min: ROBUST_RANGE.min,
              max: ROBUST_RANGE.max
            },
            input: suffix
              ? { endAdornment: <InputAdornment position="end">{suffix}</InputAdornment> }
              : undefined
          }}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
