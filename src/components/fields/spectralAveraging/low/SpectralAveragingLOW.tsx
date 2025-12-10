import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import {
  ERROR_SECS,
  LAB_IS_BOLD,
  LAB_POSITION,
  SPECTRAL_AVERAGING_MIN,
  ZOOM_SPECTRAL_AVERAGING_MAX
} from '@utils/constants.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface SpectralAveragingLOWFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
  subarray: number;
  type: number;
}

export default function SpectralAveragingLOWField({
  required = false,
  setValue,
  value,
  widthLabel = 6,
  subarray,
  type
}: SpectralAveragingLOWFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'spectralAveraging';
  const { observatoryConstants } = useOSDAccessors();
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
    const subarrayConfig = observatoryConstants.array[1].subarray.find(
      item => item.value === subarray
    );
    const spectralAverageMax =
      type === 1
        ? subarrayConfig && 'continuumSpectralAveragingMax' in subarrayConfig
          ? (subarrayConfig as any).continuumSpectralAveragingMax
          : SPECTRAL_AVERAGING_MIN
        : ZOOM_SPECTRAL_AVERAGING_MAX;

    if (num < SPECTRAL_AVERAGING_MIN || num > spectralAverageMax) {
      return t('spectralAveraging.range.error');
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
  }, [value, subarray, type, observatoryConstants]);

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
