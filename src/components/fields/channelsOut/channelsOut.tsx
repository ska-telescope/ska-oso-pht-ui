import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { CHANNELS_OUT_MAX, ERROR_SECS, LAB_POSITION } from '@utils/constants.ts';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ChannelsOutFieldProps {
  disabled?: boolean;
  required?: boolean;
  labelWidth?: number;
  maxValue?: number;
  onFocus?: Function;
  setValue?: Function;
  suffix?: any;
  value: number;
}

export default function ChannelsOutField({
  disabled = false,
  required = false,
  labelWidth = 5,
  onFocus,
  setValue,
  suffix,
  value
}: ChannelsOutFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'channelsOut';
  const [fieldValid, setFieldValid] = React.useState(true);

  const checkValue = (e: number) => {
    const num = Number(e);
    if (num > 0 && num <= CHANNELS_OUT_MAX) {
      setFieldValid(true);
      if (setValue) {
        setValue(num);
      }
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
        label={t('channelsOut.label')}
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
