import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import {
  ERROR_SECS,
  LAB_IS_BOLD,
  LAB_POSITION,
  ZOOM_CHANNELS_MAX,
  ZOOM_CHANNELS_MIN
} from '@/utils/constants';

interface ZoomChannelsProps {
  disabled?: boolean;
  required?: boolean;
  labelWidth?: number;
  setValue: Function;
  suffix?: any;
  value: number;
}

export default function ZoomChannels({
  disabled = false,
  labelWidth = 5,
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
    if (num >= ZOOM_CHANNELS_MIN && num <= ZOOM_CHANNELS_MAX) {
      setFieldValid(true);
      setValue(num);
    } else {
      setFieldValid(false);
    }
  };
  const errorMessage = fieldValid ? '' : t(FIELD + '.range.error');

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
      labelBold={LAB_IS_BOLD}
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      required={required}
      testId={FIELD}
      value={value}
      setValue={checkValue}
      onFocus={() => setHelp(FIELD)}
      suffix={suffix}
    />
  );
}
