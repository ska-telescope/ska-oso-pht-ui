import { NumberEntry, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { LAB_POSITION } from '@utils/constants.ts';
import {
  validateSkyDirection2Number,
  validateSkyDirection2Text
} from '@utils/validation/validation.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface SkyDirection2FieldProps {
  labelWidth?: number;
  setValue?: Function;
  skyUnits: number;
  value: string;
  valueFocus?: Function;
  valueTypeFocus?: Function;
  isLow?: boolean;
  setErrorText?: (error: string) => void;
}

export default function SkyDirection2Field({
  labelWidth = 5,
  setValue,
  skyUnits,
  value,
  valueFocus,
  isLow = true,
  setErrorText
}: SkyDirection2FieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'skyDirection';

  const parseResultText = validateSkyDirection2Text(value, isLow);
  const errorText = !parseResultText ? '' : t(FIELD + `.error.2.${parseResultText}`);
  if (setErrorText) {
    setErrorText(errorText); // Pass the errorText back to TargetEntry
  }

  const parseResultNumber = validateSkyDirection2Number(value, isLow);
  const errorNumber = !parseResultNumber ? '' : t(FIELD + `.error.2.${parseResultNumber}`);
  if (setErrorText) {
    setErrorText(errorText); // Pass the errorText back to TargetEntry
  }

  const SkyDirectionValueText = () => {
    return (
      <TextEntry
        errorText={errorText}
        label={t(FIELD + '.label.2.' + skyUnits.toString())}
        labelBold
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
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
        labelBold
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
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
