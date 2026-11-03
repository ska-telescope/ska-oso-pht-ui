import { NumberEntry, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface SkyDirection2FieldProps {
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

export default function SkyDirection2Field({
  required,
  setValue,
  skyUnits,
  value,
  valueFocus,
  valueBlur,
  errorText = ''
}: SkyDirection2FieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'skyDirection';

  const renderSkyDirectionValueText = () => {
    return (
      <TextEntry
        errorText={errorText}
        label={t(FIELD + '.label.2.' + skyUnits.toString())}
        suffix={t(FIELD + '.units.2.' + skyUnits.toString())}
        testId={FIELD + 'Value2'}
        value={value}
        setValue={setValue}
        onFocus={valueFocus}
        onBlur={valueBlur}
        required={required}
      />
    );
  };

  const renderSkyDirectionValueNumber = () => {
    return (
      <NumberEntry
        errorText={errorText}
        label={t(FIELD + '.label.2.' + skyUnits.toString())}
        suffix={t(FIELD + '.units.2.' + skyUnits.toString())}
        testId={FIELD + 'Value'}
        value={value}
        setValue={setValue}
        onFocus={valueFocus}
        onBlur={valueBlur}
        required={required}
      />
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {skyUnits.toString() === '0' && renderSkyDirectionValueText()}
      {skyUnits.toString() === '1' && renderSkyDirectionValueNumber()}
    </Box>
  );
}
