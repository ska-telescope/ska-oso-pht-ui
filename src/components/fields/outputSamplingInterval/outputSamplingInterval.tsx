import React from 'react';
import { Box } from '@mui/system';
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
  const EPSILON = 1e-6;

  const validateMultiplier = (multiplier: number) =>
    Number.isInteger(multiplier) && multiplier >= 1
      ? ''
      : t('outputSamplingInterval.error.multiple', {
          value: FUNDAMENTAL_INTERVAL_MS.toFixed(3)
        });

  const handleSetValue = (rawMultiplier: number) => {
    const roundedMultiplier = Math.round(rawMultiplier);
    const isIntegerMultiple = Math.abs(rawMultiplier - roundedMultiplier) < EPSILON;
    const error = validateMultiplier(isIntegerMultiple ? roundedMultiplier : rawMultiplier);
    setErrorText(error);
    if (!error) {
      setValue?.(roundedMultiplier);
    }
  };

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
          if (raw === '' || Number.isNaN(Number(raw))) {
            return null;
          }
          return Number(raw) / FUNDAMENTAL_INTERVAL_MS;
        }}
        onStep={(currentValue: number, direction: 1 | -1) => Math.max(1, currentValue + direction)}
        onCommit={handleSetValue}
        onBlurCommit={(committedMultiplier: number) =>
          setErrorText(validateMultiplier(committedMultiplier))
        }
        label={t(FIELD + '.label')}
        onFocus={() => setHelp(FIELD)}
        required={required}
        disabled={disabled}
        min={FUNDAMENTAL_INTERVAL_MS}
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
