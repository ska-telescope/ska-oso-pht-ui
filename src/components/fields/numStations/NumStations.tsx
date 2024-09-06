import React from 'react';
import { useTranslation } from 'react-i18next';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { NumberEntry } from '@ska-telescope/ska-gui-components';

interface NumStationsFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export default function NumStationsField({
  disabled = false,
  setValue,
  value,
  widthLabel = 6
}: NumStationsFieldProps) {
  const { t } = useTranslation('pht');
  const { helpComponent } = storageObject.useStore();
  const FIELD = 'numStations';

  const validate = (e: number) => {
    const num = Number(Math.abs(e).toFixed(0));
    if (num >= Number(t(FIELD + '.range.lower')) && num <= Number(t(FIELD + '.range.upper'))) {
      setValue(num);
    }
  };

  return (
    <NumberEntry
      disabled={disabled}
      label={t(FIELD + '.label')}
      labelBold={LAB_IS_BOLD}
      labelPosition={LAB_POSITION}
      labelWidth={widthLabel}
      testId={FIELD}
      value={value}
      setValue={validate}
      onFocus={() => helpComponent(t(FIELD + '.help'))}
    />
  );
}
