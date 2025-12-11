import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { ERROR_SECS, LAB_POSITION } from '@utils/constants.ts';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface PixelSizeFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  required?: boolean;
  setValue: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  labelWidth?: number;
}
export default function PixelSizeField({
  disabled = false,
  required = false,
  labelWidth = 5,
  onFocus,
  setValue,
  suffix,
  value
}: PixelSizeFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'pixelSize';
  const [fieldValid, setFieldValid] = React.useState(true);

  const checkValue = (e: number) => {
    const num = Number(e);
    if (num > 0) {
      setFieldValid(true);
      setValue(num);
    } else {
      setFieldValid(false);
    }
  };

  const errorMessage = fieldValid ? '' : t(FIELD + '.error');

  React.useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setFieldValid(true);
      }, ERROR_SECS);
    };
    timer();
  }, [fieldValid]);

  return (
    <Box pt={1}>
      <NumberEntry
        label={t(FIELD + '.label')}
        labelBold
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        testId={FIELD}
        value={value}
        setValue={checkValue}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        suffix={suffix}
        errorText={errorMessage}
      />
    </Box>
  );
}
