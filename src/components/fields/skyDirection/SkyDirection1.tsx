import { NumberEntry, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { LAB_POSITION } from '@utils/constants.ts';
import {
  validateSkyDirection1Number,
  validateSkyDirection1Text
} from '@utils/validation/validation.tsx';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface SkyDirection1FieldProps {
  labelWidth?: number;
  setValue?: Function;
  skyUnits: number;
  value: string;
  valueFocus?: Function;
  valueTypeFocus?: Function;
  setErrorText?: (error: string) => void;
}

export default function SkyDirection1Field({
  labelWidth = 5,
  setValue,
  skyUnits,
  value,
  valueFocus,
  setErrorText
}: SkyDirection1FieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'skyDirection';

  const errorText = validateSkyDirection1Text(value) ? '' : t(FIELD + '.error.1.0');
  const errorNumber = validateSkyDirection1Number(value) ? '' : t(FIELD + '.error.1.0');

  React.useEffect(() => {
    if (setErrorText) {
      if (skyUnits.toString() === '0') {
        setErrorText(errorText); // Pass the errorText back to TargetEntry
      } else if (skyUnits.toString() === '1') {
        setErrorText(errorNumber); // Pass the errorText back to TargetEntry
      }
    }
  }, [errorText, errorNumber]);

  const SkyDirectionValueText = () => (
    <TextEntry
      errorText={errorText}
      label={t(FIELD + '.label.1.' + skyUnits.toString())}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      suffix={t(FIELD + '.units.1.' + skyUnits.toString())}
      testId={FIELD + 'Value1'}
      value={value}
      setValue={setValue}
      onFocus={valueFocus}
      required
    />
  );

  const SkyDirectionValueNumber = () => (
    <NumberEntry
      errorText={errorNumber}
      label={t(FIELD + '.label.1.' + skyUnits.toString())}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      suffix={t(FIELD + '.units.1.' + skyUnits.toString())}
      testId={FIELD + 'Value'}
      value={value}
      setValue={setValue}
      onFocus={valueFocus}
      required
    />
  );

  return (
    <Box sx={{ width: '100%' }}>
      {skyUnits.toString() === '0' && SkyDirectionValueText()}
      {skyUnits.toString() === '1' && SkyDirectionValueNumber()}
    </Box>
  );
}
