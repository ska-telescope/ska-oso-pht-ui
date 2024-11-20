import React from 'react';
import { useTranslation } from 'react-i18next';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';

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
export const ELEVATION_MIN = [15, 15];
export const ELEVATION_MAX = [59.2, 59.2];
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
    const occ = isLow ? 0 : 1;
    return value < ELEVATION_MIN[occ] || value > ELEVATION_MAX[occ]
      ? t('elevation.range.error', {
          min: ELEVATION_MIN[occ],
          max: ELEVATION_MAX[occ]
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
