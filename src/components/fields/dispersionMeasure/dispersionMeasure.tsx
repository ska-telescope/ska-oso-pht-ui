import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { ERROR_SECS } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

interface DispersionMeasureFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export default function DispersionMeasureField({
  required = false,
  setValue,
  value
}: DispersionMeasureFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'dispersionMeasure';
  const [errorText, setErrorText] = React.useState('');
  const { observatoryConstants } = useOSDAccessors();
  React.useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setErrorText('');
      }, ERROR_SECS);
    };
    timer();
  }, [errorText]);

  const validateValue = (num: number) => {
    if (
      num < observatoryConstants.DispersionMeasure.min ||
      num > observatoryConstants.DispersionMeasure.max
    ) {
      return t('dispersionMeasure.range.error', {
        min: observatoryConstants.DispersionMeasure.min,
        max: observatoryConstants.DispersionMeasure.max
      });
    }
    return '';
  };

  const handleSetValue = (raw: number) => {
    const num = Number(raw);
    const error = validateValue(num);
    if (error) {
      setErrorText(error);
    } else {
      setErrorText('');
      setValue?.(num);
    }
  };

  React.useEffect(() => {
    const error = validateValue(value);
    setErrorText(error);
  }, [value]);

  return (
    <Box pt={1}>
      <NumberEntry
        testId={FIELD}
        value={String(value)}
        setValue={handleSetValue}
        label={t(FIELD + '.label')}
        onFocus={() => setHelp(FIELD)}
        required={required}
        errorText={errorText}
      />
    </Box>
  );
}
