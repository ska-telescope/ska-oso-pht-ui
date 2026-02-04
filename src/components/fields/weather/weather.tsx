import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { ERROR_SECS } from '@utils/constants.ts';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface WeatherFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  isLow?: boolean;
  required?: boolean;
  setValue?: Function;
  label?: string;
  suffix?: any;
  testId: string;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export default function WeatherField({
  onFocus = undefined,
  setValue,
  value,
  label = ''
}: WeatherFieldProps) {
  const { t } = useScopedTranslation();
  const [fieldValid, setFieldValid] = React.useState(true);
  const min = Number(t('weather.range.lower'));
  const max = Number(t('weather.range.upper'));

  const checkValue = (e: number) => {
    const num = Number(e);

    if (num >= min && num <= max) {
      setFieldValid(true);
      if (setValue) {
        setValue(num);
      }
    } else {
      setFieldValid(false);
    }
  };

  const errorMessage = fieldValid
    ? ''
    : t('weather.range.error', {
        min: min,
        max: max
      });

  React.useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setFieldValid(true);
      }, ERROR_SECS);
    };
    timer();
  }, [fieldValid]);

  const weatherUnitsField = () => t('weather.units');

  return (
    <Box pt={1}>
      <NumberEntry
        errorText={errorMessage}
        label={label}
        testId="weather"
        value={value}
        setValue={checkValue}
        onFocus={onFocus}
        suffix={weatherUnitsField()}
      />
    </Box>
  );
}
