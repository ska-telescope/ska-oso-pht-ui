import React from 'react';
import { useTranslation } from 'react-i18next';
import { LABEL_POSITION, NumberEntry, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';

interface SkyDirection1FieldProps {
  labelWidth?: number;
  setValue?: Function;
  skyUnits: number;
  value: string;
  valueFocus?: Function;
  valueTypeFocus?: Function;
}

export default function SkyDirection1Field({
  labelWidth = 5,
  setValue,
  skyUnits,
  value,
  valueFocus
}: SkyDirection1FieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'skyDirection';

  const SkyDirectionValueText = () => (
    <TextEntry
      label={t(FIELD + '.label.1.' + skyUnits.toString())}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={labelWidth}
      suffix={t(FIELD + '.units.1.' + skyUnits.toString())}
      testId={FIELD + 'Value'}
      value={value}
      setValue={setValue}
      onFocus={valueFocus}
    />
  );

  const SkyDirectionValueNumber = () => (
    <NumberEntry
      label={t(FIELD + '.label.1.' + skyUnits.toString())}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={labelWidth}
      suffix={t(FIELD + '.units.1.' + skyUnits.toString())}
      testId={FIELD + 'Value'}
      value={value}
      setValue={setValue}
      onFocus={valueFocus}
    />
  );

  return (
    <Box p={1} pb={0} pt={0} sx={{ width: '100%' }}>
      {skyUnits.toString() === '0' && SkyDirectionValueText()}
      {skyUnits.toString() === '1' && SkyDirectionValueNumber()}
    </Box>
  );
}
