import React from 'react';
import { Box } from '@mui/system';
import { z } from 'zod';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import SelectField from '@/components/wrappers/selectField/SelectField';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';

interface OutputSamplingIntervalFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export const outputSamplingIntervalSchema = z.number().finite().int().min(1);

export default function OutputSamplingIntervalField({
  disabled = false,
  required = false,
  setValue,
  value
}: OutputSamplingIntervalFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'outputSamplingInterval';
  const [errorText, setErrorText] = React.useState('');
  const OUTPUT_SAMPLING_INTERVAL_UNIT_VALUE = 0;
  const FUNDAMENTAL_INTERVAL_MS = 0.20736;

  const validateMultiplier = (multiplier: number) =>
    outputSamplingIntervalSchema.safeParse(multiplier).success
      ? ''
      : t('outputSamplingInterval.error.multiple', {
          value: FUNDAMENTAL_INTERVAL_MS.toFixed(3)
        });

  const commit = (multiplier: number) => {
    setValue?.(multiplier);
    setErrorText(validateMultiplier(multiplier));
  };

  const stepMultiplier = (multiplier: number, direction: 1 | -1) =>
    Math.max(
      1,
      Number.isInteger(multiplier)
        ? multiplier + direction
        : direction === 1
          ? Math.ceil(multiplier)
          : Math.floor(multiplier)
    );

  React.useEffect(() => {
    setErrorText(validateMultiplier(value));
  }, [value]);

  return (
    <Box pt={1}>
      <SteppedNumberField
        testId={FIELD}
        value={value}
        format={(multiplier: number) => (multiplier * FUNDAMENTAL_INTERVAL_MS).toFixed(3)}
        parse={(raw: string) => {
          if (raw === '' || Number.isNaN(Number(raw))) return null;
          const typedDisplayValue = Number(raw);
          const rawMultiplier = typedDisplayValue / FUNDAMENTAL_INTERVAL_MS;
          const nearestMultiplier = Math.max(1, Math.round(rawMultiplier));
          const nearestDisplayValue = Number(
            (nearestMultiplier * FUNDAMENTAL_INTERVAL_MS).toFixed(3)
          );
          return typedDisplayValue === nearestDisplayValue ? nearestMultiplier : rawMultiplier;
        }}
        onStep={stepMultiplier}
        onCommit={commit}
        label={t(FIELD + '.label')}
        onFocus={() => setHelp(FIELD)}
        required={required}
        disabled={disabled}
        step={FUNDAMENTAL_INTERVAL_MS}
        errorText={errorText}
        suffix={
          <Box sx={{ minWidth: 90 }}>
            <SelectField
              testId={FIELD + 'Units'}
              disabled
              options={[{ label: t(FIELD + '.units'), value: OUTPUT_SAMPLING_INTERVAL_UNIT_VALUE }]}
              value={OUTPUT_SAMPLING_INTERVAL_UNIT_VALUE}
              setValue={() => {}}
            />
          </Box>
        }
      />
    </Box>
  );
}
