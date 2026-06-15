import { Grid } from '@mui/material';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface RobustFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  label: string;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: string | number;
  widthButton?: number;
}

export default function RobustField({
  disabled = false,
  onFocus = undefined,
  label,
  required = false,
  setValue = undefined,
  suffix = null,
  value,
  widthButton = 0
}: RobustFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'robust';
  const [inputValue, setInputValue] = React.useState(String(value ?? ''));

  React.useEffect(() => {
    setInputValue(String(value ?? ''));
  }, [value]);

  const validateValue = (inValue: string) => /^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(inValue);

  const handleSetValue = (nextValue: string) => {
    setInputValue(nextValue);
    if (!validateValue(nextValue)) {
      return;
    }

    if (setValue) {
      setValue(Number(nextValue));
    }
  };

  const errorText = inputValue.length > 0 && !validateValue(inputValue) ? t('robust.error') : '';

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <TextEntry
          disabled={disabled}
          errorText={errorText}
          testId={FIELD}
          value={inputValue}
          setValue={handleSetValue}
          label={label}
          onFocus={onFocus}
          required={required}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
