import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { ERROR_SECS } from '@utils/constants.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface OutputSamplingIntervalFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export default function OutputSamplingIntervalField({
  required = false,
  setValue,
  value
}: OutputSamplingIntervalFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'outputSamplingInterval';
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
      num < observatoryConstants.OutputSamplingInterval.min ||
      num > observatoryConstants.OutputSamplingInterval.max
    ) {
      return t('outputSamplingInterval.range.error', {
        min: observatoryConstants.OutputSamplingInterval.min,
        max: observatoryConstants.OutputSamplingInterval.max
      });
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
        value={value}
        setValue={(v: number) => handleSetValue(Number(v))}
        label={t(FIELD + '.label')}
        onFocus={() => setHelp(FIELD)}
        required={required}
        errorText={errorText}
      />
    </Box>
  );
}
