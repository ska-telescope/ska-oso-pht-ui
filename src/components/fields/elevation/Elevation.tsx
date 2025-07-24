import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import ObservatoryData from '@utils/types/observatoryData.tsx';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';

interface ElevationFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  isLow?: boolean;
  required?: boolean;
  setValue?: Function;
  label?: string;
  suffix?: any;
  testId: string;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export const ELEVATION_DEFAULT = [45, 20];
export const ELEVATION_MIN_LOW = 15;
export const ELEVATION_MAX = 59.2;
export const ELEVATION_UNITS = 'deg';

export default function ElevationField({
  disabled = false,
  isLow = false,
  onFocus = null,
  label = '',
  required = false,
  setValue,
  testId,
  value,
  widthLabel = 6
}: ElevationFieldProps) {
  const { t } = useTranslation('pht');

  const errorMessage = () => {
    const { application } = storageObject.useStore();
    const data: ObservatoryData = application.content3 as ObservatoryData;
    const minElevation = isLow
      ? ELEVATION_MIN_LOW
      : data.capabilities?.mid?.basicCapabilities?.dishElevationLimitDeg;
    return value < minElevation || value > ELEVATION_MAX
      ? t('elevation.range.error', {
          min: minElevation,
          max: ELEVATION_MAX
        })
      : '';
  };

  return (
    <Box pt={1}>
      <NumberEntry
        disabled={disabled}
        errorText={errorMessage()}
        label={label}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={widthLabel}
        required={required}
        testId={testId}
        value={value}
        setValue={setValue}
        onFocus={onFocus}
        suffix={ELEVATION_UNITS}
      />
    </Box>
  );
}
