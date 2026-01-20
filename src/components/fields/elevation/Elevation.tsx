import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
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
  value
}: ElevationFieldProps) {
  const { t } = useScopedTranslation();
  const { osdMID } = useOSDAccessors();

  const errorMessage = () => {
    const minElevation = isLow
      ? ELEVATION_MIN_LOW
      : osdMID?.basicCapabilities?.dishElevationLimitDeg;
    return value < (minElevation ?? 0) || value > ELEVATION_MAX
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
