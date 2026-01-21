import { NumberEntry, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import {
  validateSkyDirection2Number,
  validateSkyDirection2Text
} from '@utils/validation/validation.tsx';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface SkyDirection2FieldProps {
  setValue?: Function;
  skyUnits: number;
  value: string;
  valueFocus?: Function;
  valueTypeFocus?: Function;
  setErrorText?: (error: string) => void;
}

export default function SkyDirection2Field({
  setValue,
  skyUnits,
  value,
  valueFocus,
  setErrorText
}: SkyDirection2FieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'skyDirection';

  const parseResultText = validateSkyDirection2Text(value);
  const errorText = !parseResultText ? '' : t(FIELD + `.error.2.${parseResultText}`);

  const parseResultNumber = validateSkyDirection2Number(value);
  const errorNumber = !parseResultNumber ? '' : t(FIELD + `.error.2.${parseResultNumber}`);

  React.useEffect(() => {
    if (setErrorText) {
      if (skyUnits.toString() === '0') {
        setErrorText(errorText); // Pass the errorText back to TargetEntry
      } else if (skyUnits.toString() === '1') {
        setErrorText(errorNumber); // Pass the errorText back to TargetEntry
      }
    }
  }, [errorText, errorNumber]);

  const SkyDirectionValueText = () => {
    return (
      <TextEntry
        errorText={errorText}
        label={t(FIELD + '.label.2.' + skyUnits.toString())}
        suffix={t(FIELD + '.units.2.' + skyUnits.toString())}
        testId={FIELD + 'Value2'}
        value={value}
        setValue={setValue}
        onFocus={valueFocus}
        required
      />
    );
  };

  const SkyDirectionValueNumber = () => {
    return (
      <NumberEntry
        errorText={errorNumber}
        label={t(FIELD + '.label.2.' + skyUnits.toString())}
        suffix={t(FIELD + '.units.2.' + skyUnits.toString())}
        testId={FIELD + 'Value'}
        value={value}
        setValue={setValue}
        onFocus={valueFocus}
        required
      />
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {skyUnits.toString() === '0' && SkyDirectionValueText()}
      {skyUnits.toString() === '1' && SkyDirectionValueNumber()}
    </Box>
  );
}
