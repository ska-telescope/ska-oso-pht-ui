import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Box } from '@mui/system';
import {
  LAB_IS_BOLD,
  LAB_POSITION,
  SPECTRAL_AVERAGING_MIN,
  ZOOM_SPECTRAL_AVERAGING_MAX
} from '@utils/constants.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

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
  const { helpComponent } = storageObject.useStore();
  const FIELD = 'spectralAveraging';
  const { observatoryConstants } = useOSDAccessors();

  const errorMessage = () => {
    const subarrayConfig = observatoryConstants.array[1].subarray.find(
      item => item.value === subarray
    );
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
