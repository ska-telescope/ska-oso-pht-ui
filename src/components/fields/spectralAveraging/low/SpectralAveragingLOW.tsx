import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  LAB_IS_BOLD,
  LAB_POSITION,
  OBSERVATION,
  SPECTRAL_AVERAGING_MIN,
  ZOOM_SPECTRAL_AVERAGING_MAX
} from '../../../../utils/constants';
import { Box } from '@mui/system';

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
  const { t } = useTranslation('pht');
  const { helpComponent } = storageObject.useStore();
  const FIELD = 'spectralAveraging';

  const errorMessage = () => {
    const subarrayConfig = OBSERVATION.array[1].subarray.find(item => item.value === subarray);
    let spectralAverageMax: number;
    spectralAverageMax =
      type === 1 ? subarrayConfig?.continuumSpectralAveragingMax : ZOOM_SPECTRAL_AVERAGING_MAX;
    return value < SPECTRAL_AVERAGING_MIN || value > spectralAverageMax
      ? t('spectralAveraging.range.error')
      : '';
  };

  return (
    <Box pt={1}>
      <NumberEntry
        testId="spectralAveraging"
        value={String(value)}
        setValue={setValue}
        label={t(FIELD + '.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={widthLabel}
        onFocus={() => helpComponent(t(FIELD + '.help'))}
        required={required}
        errorText={errorMessage()}
      />
    </Box>
  );
}
