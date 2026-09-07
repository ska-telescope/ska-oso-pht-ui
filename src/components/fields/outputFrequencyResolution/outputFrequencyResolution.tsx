import React from 'react';
import { Box } from '@mui/system';
import { z } from 'zod';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import SelectField from '@/components/wrappers/selectField/SelectField';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';

interface OutputFrequencyResolutionFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export const outputFrequencyResolutionSchema = z.number().finite().int().min(1);

export default function OutputFrequencyResolutionField({
  disabled = false,
  required = false,
  setValue,
  value
}: OutputFrequencyResolutionFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'outputFrequencyResolution';
  const [errorText, setErrorText] = React.useState('');
  const OUTPUT_FREQUENCY_RESOLUTION_UNIT_VALUE = 0;
  const FUNDAMENTAL_RESOLUTION_KHZ = 781.25 / 216;

  const validateMultiplier = (multiplier: number) =>
    outputFrequencyResolutionSchema.safeParse(multiplier).success
      ? ''
      : t('outputFrequencyResolution.error.multiple', {
          value: FUNDAMENTAL_RESOLUTION_KHZ.toFixed(2)
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
        format={(multiplier: number) => (multiplier * FUNDAMENTAL_RESOLUTION_KHZ).toFixed(2)}
        parse={(raw: string) => {
          if (raw === '' || Number.isNaN(Number(raw))) return null;
          const typedDisplayValue = Number(raw);
          const rawMultiplier = typedDisplayValue / FUNDAMENTAL_RESOLUTION_KHZ;
          const nearestMultiplier = Math.max(1, Math.round(rawMultiplier));
          const nearestDisplayValue = Number(
            (nearestMultiplier * FUNDAMENTAL_RESOLUTION_KHZ).toFixed(2)
          );
          return typedDisplayValue === nearestDisplayValue ? nearestMultiplier : rawMultiplier;
        }}
        onStep={stepMultiplier}
        onCommit={commit}
        label={t(FIELD + '.label')}
        onFocus={() => setHelp(FIELD)}
        required={required}
        disabled={disabled}
        step={FUNDAMENTAL_RESOLUTION_KHZ}
        errorText={errorText}
        suffix={
          <Box sx={{ minWidth: 90 }}>
            <SelectField
              testId={FIELD + 'Units'}
              disabled
              options={[
                { label: t(FIELD + '.units'), value: OUTPUT_FREQUENCY_RESOLUTION_UNIT_VALUE }
              ]}
              value={OUTPUT_FREQUENCY_RESOLUTION_UNIT_VALUE}
              setValue={() => {}}
            />
          </Box>
        }
      />
    </Box>
  );
}
