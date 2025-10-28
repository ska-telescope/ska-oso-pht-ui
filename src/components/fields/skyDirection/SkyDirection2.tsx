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
}

export default function SkyDirection2Field({
  labelWidth = 5,
  setValue,
  skyUnits,
  value,
  valueFocus,
  isLow = true
}: SkyDirection2FieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'skyDirection';

  const SkyDirectionValueText = () => {
    const parseResult = validateSkyDirection2Text(value, isLow);
    return (
      <TextEntry
        errorText={!parseResult ? '' : t(FIELD + `.error.2.${parseResult}`)}
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
    const parseResult = validateSkyDirection2Number(value, isLow);
    return (
      <NumberEntry
        errorText={!parseResult ? '' : t(FIELD + `.error.2.${parseResult}`)}
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
