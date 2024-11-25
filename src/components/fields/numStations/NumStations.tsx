import React from 'react';
import { useTranslation } from 'react-i18next';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';

interface NumStationsFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
  rangeLower?: number;
  rangeUpper?: number;
}

export default function NumStationsField({
  disabled = false,
  setValue,
  value,
  widthLabel = 6,
  rangeLower = 0,
  rangeUpper = 1
}: NumStationsFieldProps) {
  const { t } = useTranslation('pht');
  const { helpComponent } = storageObject.useStore();
  const FIELD = 'numStations';

  const validate = (e: number) => {
    const str = Math.abs(e).toString();
    const num = Number(str);
    if (num >= rangeLower && num <= rangeUpper) {
      setValue(num.toString());
    }
  };

  return (
    <Box pt={1}>
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
    </Box>
  );
}
