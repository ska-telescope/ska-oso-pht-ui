import React from 'react';
import { Box } from '@mui/system';
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
  const EPSILON = 1e-6;

  const validateMultiplier = (multiplier: number) =>
    Number.isInteger(multiplier) && multiplier >= 1
      ? ''
      : t('outputFrequencyResolution.error.multiple', {
          value: FUNDAMENTAL_RESOLUTION_KHZ.toFixed(2)
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
        format={(multiplier: number) => (multiplier * FUNDAMENTAL_RESOLUTION_KHZ).toFixed(2)}
        parse={(raw: string) => {
          if (raw === '' || Number.isNaN(Number(raw))) {
            return null;
          }
          return Number(raw) / FUNDAMENTAL_RESOLUTION_KHZ;
        }}
        onStep={(currentValue: number, direction: 1 | -1) => Math.max(1, currentValue + direction)}
        onCommit={handleSetValue}
        label={t(FIELD + '.label')}
        onFocus={() => setHelp(FIELD)}
        required={required}
        disabled={disabled}
        min={FUNDAMENTAL_RESOLUTION_KHZ}
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
