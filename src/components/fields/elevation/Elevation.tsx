import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { ERROR_SECS, LAB_IS_BOLD, LAB_POSITION } from '@utils/constants.ts';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

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
  onFocus = undefined,
  label = '',
  required = false,
  setValue,
  testId,
  value,
  widthLabel = 6
}: ElevationFieldProps) {
  const { t } = useScopedTranslation();
  const { osdMID } = useOSDAccessors();
  const FIELD = 'elevation';
  const [fieldValid, setFieldValid] = React.useState(true);
  const minElevation = isLow ? ELEVATION_MIN_LOW : osdMID?.basicCapabilities?.dishElevationLimitDeg;

  const checkValue = (e: number) => {
    const num = Number(e);

    if (num >= minElevation && num <= ELEVATION_MAX) {
      setFieldValid(true);
      if (setValue) {
        setValue(num);
      }
    } else {
      setFieldValid(false);
    }
  };

  const errorMessage = fieldValid
    ? ''
    : t(FIELD + '.range.error', {
        min: minElevation,
        max: ELEVATION_MAX
      });

  React.useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setFieldValid(true);
      }, ERROR_SECS);
    };
    timer();
  }, [fieldValid]);

  return (
    <Box pt={1}>
      <NumberEntry
        disabled={disabled}
        errorText={errorMessage}
        label={label}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={widthLabel}
        required={required}
        testId={testId}
        value={value}
        setValue={checkValue}
        onFocus={onFocus}
        suffix={ELEVATION_UNITS}
      />
    </Box>
  );
}
