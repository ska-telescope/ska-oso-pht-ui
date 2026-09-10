import React from 'react';
import { Box } from '@mui/material';
import { z } from 'zod';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';

interface TimeAveragingFieldProps {
  disabled?: boolean;
  required?: boolean;
  onFocus?: () => void;
  setValue?: (value: number) => void;
  value: number;
}

export const UNAVERAGED_VALUE_S = 0.84934656;
export const timeAveragingSchema = z.number().finite().int().min(1).max(12);

export default function TimeAveragingField({
  disabled = false,
  required = false,
  onFocus,
  setValue,
  value
}: TimeAveragingFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'timeAveraging';
  const [errorText, setErrorText] = React.useState('');
  const errorMessage = t(FIELD + '.error');

  const validateMultiplier = (multiplier: number) =>
    timeAveragingSchema.safeParse(multiplier).success ? '' : errorMessage;

  const commit = (multiplier: number) => {
    setValue?.(multiplier);
    setErrorText(validateMultiplier(multiplier));
  };

  const stepMultiplier = (multiplier: number, direction: 1 | -1) =>
    Math.min(
      12,
      Math.max(
        1,
        Number.isInteger(multiplier)
          ? multiplier + direction
          : direction === 1
            ? Math.ceil(multiplier)
            : Math.floor(multiplier)
      )
    );

  React.useEffect(() => {
    setErrorText(validateMultiplier(value));
  }, [value]);

  return (
    <Box pt={1}>
      <SteppedNumberField
        testId={FIELD}
        value={value}
        format={(multiplier) => (multiplier * UNAVERAGED_VALUE_S).toFixed(3)}
        parse={(raw) => {
          if (raw === '' || Number.isNaN(Number(raw))) return null;
          const typedDisplayValue = Number(raw);
          const rawMultiplier = typedDisplayValue / UNAVERAGED_VALUE_S;
          const nearestMultiplier = Math.min(12, Math.max(1, Math.round(rawMultiplier)));
          const nearestDisplayValue = Number((nearestMultiplier * UNAVERAGED_VALUE_S).toFixed(3));
          return typedDisplayValue === nearestDisplayValue ? nearestMultiplier : rawMultiplier;
        }}
        onStep={stepMultiplier}
        onCommit={commit}
        label={t(FIELD + '.label')}
        onFocus={onFocus}
        required={required}
        disabled={disabled}
        errorText={errorText}
        suffix={<Box sx={{ minWidth: 90 }}>{t(FIELD + '.0')}</Box>}
      />
    </Box>
  );
}
