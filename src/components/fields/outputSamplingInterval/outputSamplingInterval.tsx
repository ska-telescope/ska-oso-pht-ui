import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import {
  ERROR_SECS,
  LAB_IS_BOLD,
  LAB_POSITION,
  OUTPUT_SAMPLING_INTERVAL_MAX,
  OUTPUT_SAMPLING_INTERVAL_MIN
} from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface OutputSamplingIntervalFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export default function OutputSamplingIntervalField({
  required = false,
  setValue,
  value,
  widthLabel = 6
}: OutputSamplingIntervalFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'outputSamplingInterval';
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
    if (num < OUTPUT_SAMPLING_INTERVAL_MIN || num > OUTPUT_SAMPLING_INTERVAL_MAX) {
      return t('outputSamplingInterval.range.error');
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
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={widthLabel}
        onFocus={() => setHelp(FIELD)}
        required={required}
        errorText={errorText}
      />
    </Box>
  );
}
