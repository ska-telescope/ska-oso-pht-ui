import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  LAB_IS_BOLD,
  LAB_POSITION,
  OBSERVATION,
  SPECTRAL_AVERAGING_MIN
} from '../../../../utils/constants';

interface SpectralAveragingLOWFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
  subarray: number;
}

export default function SpectralAveragingLOWField({
  required = false,
  setValue,
  value,
  widthLabel = 6,
  subarray
}: SpectralAveragingLOWFieldProps) {
  const { t } = useTranslation('pht');
  const { helpComponent } = storageObject.useStore();
  const FIELD = 'spectralAveraging';

  const errorMessage = () => {
    const subarrayConfig = OBSERVATION.array[1].subarray.find(item => item.value === subarray);

    return value < SPECTRAL_AVERAGING_MIN || value > subarrayConfig?.spectralAveragingMax
      ? t('spectralAveraging.range.error')
      : '';
  };

  return (
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
  );
}
