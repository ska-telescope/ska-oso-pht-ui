import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import {
  CENTRAL_FREQUENCY_MAX,
  CENTRAL_FREQUENCY_MIN,
  ERROR_SECS,
  LAB_IS_BOLD,
  LAB_POSITION
} from '@/utils/constants';

interface CentralFrequencyProps {
  bandWidth: number;
  disabled?: boolean;
  required?: boolean;
  labelWidth?: number;
  observingBand: number;
  setValue: Function;
  suffix?: any;
  value: number;
}

export default function CentralFrequency({
  bandWidth,
  disabled = false,
  labelWidth = 5,
  observingBand,
  required = false,
  setValue,
  suffix,
  value
}: CentralFrequencyProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'centralFrequency';
  const [fieldValid, setFieldValid] = React.useState(true);

  React.useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setFieldValid(true);
      }, ERROR_SECS);
    };
    timer();
  }, [fieldValid]);

  const checkValue = (e: number) => {
    const num = Number(e);
    const min = CENTRAL_FREQUENCY_MIN[observingBand] + bandWidth / 2;
    const max = CENTRAL_FREQUENCY_MAX[observingBand] - bandWidth / 2;
    if (num >= min && num <= max) {
      setFieldValid(true);
      setValue(num);
    } else {
      setFieldValid(false);
    }
  };
  const errorMessage = fieldValid ? '' : t(FIELD + '.range.error');

  return (
    <NumberEntry
      disabled={disabled}
      label={t(FIELD + '.label')}
      labelBold={LAB_IS_BOLD}
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      testId={FIELD}
      value={value}
      setValue={checkValue}
      onFocus={() => setHelp(FIELD)}
      required={required}
      suffix={suffix}
      errorText={errorMessage}
    />
  );
}
