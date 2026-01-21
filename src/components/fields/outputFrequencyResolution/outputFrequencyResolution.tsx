import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import {
  ERROR_SECS,
  OUTPUT_FREQUENCY_RESOLUTION_MAX,
  OUTPUT_FREQUENCY_RESOLUTION_MIN
} from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface OutputFrequencyResolutionFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export default function OutputFrequencyResolutionField({
  required = false,
  setValue,
  value
}: OutputFrequencyResolutionFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'outputFrequencyResolution';
  const [errorText, setErrorText] = React.useState('');

  React.useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setErrorText('');
      }, ERROR_SECS);
    };
    timer();
  }, [errorText]);

  const validateValue = (num: number) => {
    if (num < OUTPUT_FREQUENCY_RESOLUTION_MIN || num > OUTPUT_FREQUENCY_RESOLUTION_MAX) {
      return t('outputFrequencyResolution.range.error');
    }
    return '';
  };

  const handleSetValue = (num: number) => {
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
