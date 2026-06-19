import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

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
  const [zValue, setZValue] = React.useState<string>(value != null ? String(value) : '');

  React.useEffect(() => {
    setZValue(value != null ? String(value) : '');
  }, [value]);

  const handleValueChange = (zoomValue: string) => {
    setZValue(zoomValue);

    if (zoomValue === '' || isNaN(Number(zoomValue))) {
      setFieldValid(false);
      return;
    }

    const zoom = Number(zoomValue);
    const inRange = zoom >= ZOOM_CHANNELS_MIN && zoom <= maxValue;
    setFieldValid(inRange);
    if (inRange) {
      setValue(zoom);
    }
  };

  const errorMessage = fieldValid
    ? ''
    : t(FIELD + '.range.error', { min: ZOOM_CHANNELS_MIN, max: maxValue });

  return (
    <NumberEntry
      disabled={disabled}
      errorText={errorMessage}
      label={t(FIELD + '.label')}
      required={required}
      testId={FIELD}
      value={zValue}
      setValue={handleValueChange}
      onFocus={() => setHelp(FIELD)}
      suffix={suffix}
    />
  );
}
