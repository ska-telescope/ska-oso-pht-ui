import React from 'react';
import { Box } from '@mui/system';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import SelectField from '@/components/wrappers/selectField/SelectField';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';

interface RotationMeasureFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export default function RotationMeasureField({
  disabled = false,
  required = false,
  setValue,
  value
}: RotationMeasureFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'rotationMeasure';
  const [errorText, setErrorText] = React.useState('');
  const ROTATION_MEASURE_UNIT_VALUE = 0;

  const validateValue = (num: number) =>
    Number.isInteger(num) ? '' : t('rotationMeasure.error.integer');

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
        onStep={(currentValue: number, direction: 1 | -1) => currentValue + direction}
        onCommit={handleSetValue}
        label={t(FIELD + '.label')}
        onFocus={() => setHelp(FIELD)}
        required={required}
        disabled={disabled}
        step={1}
        errorText={errorText}
        suffix={
          <Box sx={{ minWidth: 100 }}>
            <SelectField
              testId={FIELD + 'Units'}
              disabled
              options={[{ label: t(FIELD + '.units'), value: ROTATION_MEASURE_UNIT_VALUE }]}
              value={ROTATION_MEASURE_UNIT_VALUE}
              setValue={() => {}}
            />
          </Box>
        }
      />
    </Box>
  );
}
