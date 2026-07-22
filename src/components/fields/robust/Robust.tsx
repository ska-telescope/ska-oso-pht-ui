import { Grid, InputAdornment, TextField } from '@mui/material';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface RobustFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  label: string;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: string | number;
  widthButton?: number;
}

const validateNumericText = (value: string, min: number, max: number): boolean => {
  const numericPattern = /^[-+]?(?:\d+\.?\d*|\.\d+)$/;
  if (!numericPattern.test(value)) {
    return false;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
};

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
  const FIELD = 'robust';
  const ROBUST_RANGE = { min: -2, max: 2 };
  const ROBUST_STEP = 0.1;
  const [inputValue, setInputValue] = React.useState(String(value ?? ''));

  React.useEffect(() => {
    setInputValue(String(value ?? ''));
  }, [value]);

  const handleSetValue = (nextValue: string) => {
    setInputValue(nextValue);
    if (!validateNumericText(nextValue, ROBUST_RANGE.min, ROBUST_RANGE.max)) {
      return;
    }

    if (setValue) {
      setValue(Number(nextValue));
    }
  };

  const errorText =
    inputValue.length > 0 && !validateNumericText(inputValue, ROBUST_RANGE.min, ROBUST_RANGE.max)
      ? t('robust.error')
      : '';

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
          onChange={(e) => handleSetValue(e.target.value)}
          label={label}
          onFocus={() => onFocus?.()}
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
