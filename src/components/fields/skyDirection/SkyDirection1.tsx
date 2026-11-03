import { NumberEntry, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface SkyDirection1FieldProps {
  required?: boolean;
  setValue?: Function;
  skyUnits: number;
  value: string;
  valueFocus?: Function;
  valueTypeFocus?: Function;
  valueBlur?: Function;
  // Already translated; the entry form's schema does the checking
  errorText?: string;
}

export default function SkyDirection1Field({
  required,
  setValue,
  skyUnits,
  value,
  valueFocus,
  valueBlur,
  errorText = ''
}: SkyDirection1FieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'skyDirection';

  const renderSkyDirectionValueText = () => (
    <TextEntry
      errorText={errorText}
      label={t(FIELD + '.label.1.' + skyUnits.toString())}
      suffix={t(FIELD + '.units.1.' + skyUnits.toString())}
      testId={FIELD + 'Value1'}
      value={value}
      setValue={setValue}
      onFocus={valueFocus}
      onBlur={valueBlur}
      required={required}
    />
  );

  const renderSkyDirectionValueNumber = () => (
    <NumberEntry
      errorText={errorText}
      label={t(FIELD + '.label.1.' + skyUnits.toString())}
      suffix={t(FIELD + '.units.1.' + skyUnits.toString())}
      testId={FIELD + 'Value'}
      value={value}
      setValue={setValue}
      onFocus={valueFocus}
      onBlur={valueBlur}
      required={required}
    />
  );

  return (
    <Box sx={{ width: '100%' }}>
      {skyUnits.toString() === '0' && renderSkyDirectionValueText()}
      {skyUnits.toString() === '1' && renderSkyDirectionValueNumber()}
    </Box>
  );
}
