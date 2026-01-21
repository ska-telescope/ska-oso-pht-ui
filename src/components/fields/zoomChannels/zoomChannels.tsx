import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { ERROR_SECS } from '@/utils/constants';

const ZOOM_CHANNELS_MIN = 1;

interface ZoomChannelsProps {
  disabled?: boolean;
  required?: boolean;
  maxValue: number;
  setValue: Function;
  suffix?: any;
  value: number;
}

export default function ZoomChannels({
  disabled = false,
  maxValue,
  required = false,
  setValue,
  suffix,
  value
}: ZoomChannelsProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'zoomChannels';
  const [fieldValid, setFieldValid] = React.useState(true);

  const checkValue = (e: number) => {
    const num = Number(e);
    if (num >= ZOOM_CHANNELS_MIN && num <= maxValue) {
      setFieldValid(true);
      setValue(num);
    } else {
      setFieldValid(false);
    }
  };
  const errorMessage = fieldValid
    ? ''
    : t(FIELD + '.range.error', { min: ZOOM_CHANNELS_MIN, max: maxValue });

  React.useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setFieldValid(true);
      }, ERROR_SECS);
    };
    timer();
  }, [fieldValid]);

  return (
    <NumberEntry
      disabled={disabled}
      errorText={errorMessage}
      label={t(FIELD + '.label')}
      required={required}
      testId={FIELD}
      value={value}
      setValue={checkValue}
      onFocus={() => setHelp(FIELD)}
      suffix={suffix}
    />
  );
}
