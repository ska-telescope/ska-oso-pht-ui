import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { ERROR_SECS } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useAutoClearingState } from '@/utils/hooks/useAutoClearingState';

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

export const ELEVATION_UNITS = 'deg';

export default function ElevationField({
  disabled = false,
  isLow = false,
  onFocus = undefined,
  label = '',
  required = false,
  setValue,
  testId,
  value
}: ElevationFieldProps) {
  const { t } = useScopedTranslation();
  const { osdLOW, osdMID } = useOSDAccessors();
  const FIELD = 'elevation';
  const [fieldValid, setFieldValid] = useAutoClearingState(true, ERROR_SECS);
  // The elevation range from the OSD. It is not checked while the OSD isn't loaded.
  const limits = (isLow ? osdLOW : osdMID)?.basicCapabilities;
  const MIN_ELEVATION = limits?.minElevationDeg ?? -Infinity;
  const MAX_ELEVATION = limits?.maxElevationDeg ?? Infinity;

  const checkValue = (e: number) => {
    const num = Number(e);

    if (num >= MIN_ELEVATION && num <= MAX_ELEVATION) {
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
        min: MIN_ELEVATION,
        max: MAX_ELEVATION
      });

  return (
    <Box
      sx={{
        pt: 1
      }}
    >
      <NumberEntry
        disabled={disabled}
        errorText={errorMessage}
        label={label}
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
