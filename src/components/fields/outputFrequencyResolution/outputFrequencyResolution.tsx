import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { ERROR_SECS } from '@utils/constants.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { useAutoClearingState } from '@/utils/hooks/useAutoClearingState';

interface OutputFrequencyResolutionFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export default function OutputFrequencyResolutionField({
  disabled = false,
  required = false,
  setValue,
  value
}: OutputFrequencyResolutionFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'outputFrequencyResolution';
  const [errorText, setErrorText] = useAutoClearingState('', ERROR_SECS);
  const { observatoryConstants } = useOSDAccessors();

  const validateValue = (num: number) => {
    if (
      num < observatoryConstants.OutputFrequencyResolution.min ||
      num > observatoryConstants.OutputFrequencyResolution.max
    ) {
      return t('outputFrequencyResolution.range.error', {
        min: observatoryConstants.OutputFrequencyResolution.min,
        max: observatoryConstants.OutputFrequencyResolution.max
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
      if (setValue) {
        setValue(num);
      }
    }
  };

  React.useEffect(() => {
    const error = validateValue(value);
    setErrorText(error);
  }, [value]);

  return (
    <Box pt={1}>
      <NumberEntry
        disabled={disabled}
        disabledUnderline={disabled}
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
