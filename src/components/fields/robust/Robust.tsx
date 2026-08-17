import React from 'react';
import { Grid, TextField } from '@mui/material';
import { z } from 'zod';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useNumericInput } from '@/utils/hooks/useNumericInput';

interface RobustFieldProps {
  disabled?: boolean;
  onFocus?: () => void;
  label: string;
  setValue: (nextValue: number) => void;
  suffix?: React.ReactNode;
  value: number;
  widthButton?: number;
}

export const ROBUST_RANGE = { min: -2, max: 2 };
export const robustSchema = z.number().min(ROBUST_RANGE.min).max(ROBUST_RANGE.max);
const ROBUST_STEP = 0.1;

export default function RobustField({
  disabled = false,
  onFocus = undefined,
  label,
  setValue,
  suffix = null,
  value,
  widthButton = 0
}: RobustFieldProps) {
  const { t } = useScopedTranslation();
  const robustErrorMessage = t('robust.error');
  const validateRobust = React.useCallback(
    (num: number) => (robustSchema.safeParse(num).success ? '' : robustErrorMessage),
    [robustErrorMessage]
  );
  const { text, error, handleChange } = useNumericInput(value, setValue, {
    validate: validateRobust,
    requiredMessage: robustErrorMessage,
    rangeMessage: robustErrorMessage
  });

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <TextField
          variant="standard"
          type="number"
          fullWidth
          disabled={disabled}
          helperText={error}
          label={label}
          value={text}
          error={!!error}
          onChange={(e) => handleChange(e.target.value)}
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
