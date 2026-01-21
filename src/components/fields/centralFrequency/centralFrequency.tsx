import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import {
  ERROR_SECS,
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  TELESCOPE_LOW_NUM
} from '@/utils/constants';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { frequencyConversion } from '@/utils/helpers';

interface CentralFrequencyProps {
  bandWidth: number;
  disabled?: boolean;
  required?: boolean;
  observingBand: string;
  setValue: Function;
  suffix?: any;
  value: number;
}

export default function CentralFrequency({
  bandWidth,
  disabled = false,
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
  const { findBand, telescopeBand } = useOSDAccessors();

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
    const band = findBand(observingBand);
    const units: number =
      telescopeBand(observingBand) === TELESCOPE_LOW_NUM ? FREQUENCY_MHZ : FREQUENCY_GHZ;
    const min = frequencyConversion(band?.minFrequencyHz ?? 0, FREQUENCY_HZ, units) + bandWidth / 2;
    const max = frequencyConversion(band?.maxFrequencyHz ?? 0, FREQUENCY_HZ, units) - bandWidth / 2;
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
