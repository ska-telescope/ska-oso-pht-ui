import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { ERROR_SECS } from '@/utils/constants';

interface SuppliedValueProps {
  disabled?: boolean;
  required?: boolean;
  labelWidth?: number;
  setValue: Function;
  suffix?: any;
  value: number;
}

export default function SuppliedValue({
  disabled = false,
  required = false,
  setValue,
  suffix,
  value
}: SuppliedValueProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'suppliedValue';
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
      label=""
      required={required}
      testId={FIELD}
      value={value}
      setValue={checkValue}
      onFocus={() => setHelp(FIELD)}
      suffix={suffix}
    />
  );
}
