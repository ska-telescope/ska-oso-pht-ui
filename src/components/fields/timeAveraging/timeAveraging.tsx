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
const MIN_MULTIPLIER = 1;
const MAX_MULTIPLIER = 12;
export const timeAveragingSchema = z
  .number()
  .finite()
  .int()
  .min(MIN_MULTIPLIER)
  .max(MAX_MULTIPLIER);

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
  const rangeErrorMessage = t(FIELD + '.error.range', {
    min: (MIN_MULTIPLIER * UNAVERAGED_VALUE_S).toFixed(3),
    max: (MAX_MULTIPLIER * UNAVERAGED_VALUE_S).toFixed(3)
  });
  const stepErrorMessage = t(FIELD + '.error.step');

  const validateMultiplier = (multiplier: number) => {
    if (
      !Number.isFinite(multiplier) ||
      multiplier < MIN_MULTIPLIER ||
      multiplier > MAX_MULTIPLIER
    ) {
      return rangeErrorMessage;
    }
    return timeAveragingSchema.safeParse(multiplier).success ? '' : stepErrorMessage;
  };

  const commit = (multiplier: number) => {
    setValue?.(multiplier);
    setErrorText(validateMultiplier(multiplier));
  };

  const stepMultiplier = (multiplier: number, direction: 1 | -1) =>
    Math.min(
      MAX_MULTIPLIER,
      Math.max(
        MIN_MULTIPLIER,
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
          const nearestMultiplier = Math.min(
            MAX_MULTIPLIER,
            Math.max(MIN_MULTIPLIER, Math.round(rawMultiplier))
          );
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
