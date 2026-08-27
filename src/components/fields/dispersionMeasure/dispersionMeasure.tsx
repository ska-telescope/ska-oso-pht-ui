import React from 'react';
import { Box } from '@mui/system';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import SelectField from '@/components/wrappers/selectField/SelectField';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';

interface DispersionMeasureFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export default function DispersionMeasureField({
  disabled = false,
  required = false,
  setValue,
  value
}: DispersionMeasureFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'dispersionMeasure';
  const [errorText, setErrorText] = React.useState('');
  const DISPERSION_MEASURE_UNIT_VALUE = 0;

  const validateValue = (num: number) =>
    Number.isInteger(num) && num >= 0 ? '' : t('dispersionMeasure.error.integer');

  const handleSetValue = (num: number) => {
    const error = validateValue(num);
    setErrorText(error);
    if (!error) {
      setValue?.(num);
    }
  };

  React.useEffect(() => {
    setErrorText(validateValue(value));
  }, [value]);

  return (
    <Box pt={1}>
      <SteppedNumberField
        testId={FIELD}
        value={value}
        onStep={(currentValue: number, direction: 1 | -1) => Math.max(0, currentValue + direction)}
        onCommit={handleSetValue}
        label={t(FIELD + '.label')}
        onFocus={() => setHelp(FIELD)}
        required={required}
        disabled={disabled}
        min={0}
        step={1}
        errorText={errorText}
        suffix={
          <Box sx={{ minWidth: 100 }}>
            <SelectField
              testId={FIELD + 'Units'}
              disabled
              options={[{ label: t(FIELD + '.units'), value: DISPERSION_MEASURE_UNIT_VALUE }]}
              value={DISPERSION_MEASURE_UNIT_VALUE}
              setValue={() => {}}
            />
          </Box>
        }
      />
    </Box>
  );
}
