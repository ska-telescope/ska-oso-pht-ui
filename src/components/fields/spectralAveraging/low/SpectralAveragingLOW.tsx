import React from 'react';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import {
  SPECTRAL_AVERAGING_MIN,
  TYPE_CONTINUUM,
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
  subarray: string;
  observationType: string;
}

export default function SpectralAveragingLOWField({
  required = false,
  setValue,
  value,
  subarray,
  observationType
}: SpectralAveragingLOWFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'spectralAveraging';
  const { observatoryConstants } = useOSDAccessors();
  const [errorText, setErrorText] = React.useState('');
  const [saValue, setSaValue] = React.useState<string>(value != null ? String(value) : '');
  
  React.useEffect(() => {
    setSaValue(value != null ? String(value) : '');
  }, [value]);

  const validateValue = (saValue: string) => {
    setSaValue(saValue);

    if (saValue === '' || isNaN(Number(saValue))) {
      return t('spectralAveraging.error');
    }

    const subarrayConfig = observatoryConstants.array[1].subarray.find(
      item => item.value === subarray
    );
    const spectralAverageMax =
      observationType === TYPE_CONTINUUM
        ? subarrayConfig && 'continuumSpectralAveragingMax' in subarrayConfig
          ? (subarrayConfig as any).continuumSpectralAveragingMax
          : SPECTRAL_AVERAGING_MIN
        : ZOOM_SPECTRAL_AVERAGING_MAX;

    const sa = Number(saValue);

    if (sa < SPECTRAL_AVERAGING_MIN || sa > spectralAverageMax) {
      return t('spectralAveraging.range.error');
    }

    return '';
  };

  const handleSetValue = (e: string) => {
    const error = validateValue(e);
    if (error) {
      setErrorText(error);
    } else {
      setErrorText('');
      setValue?.(Number(e));
    }
  };

  React.useEffect(() => {
    const error = validateValue(String(value));
    setErrorText(error);
  }, [value, subarray, observationType, observatoryConstants]);

  return (
    <Box pt={1}>
      <NumberEntry
        testId={FIELD}
        value={saValue}
        setValue={handleSetValue}
        label={t(FIELD + '.label')}
        onFocus={() => setHelp(FIELD)}
        required={required}
        errorText={errorText}
      />
    </Box>
  );
}
