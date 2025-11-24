import { DropDown } from '@ska-telescope/ska-gui-components';
import { Grid } from '@mui/material';
import { LAB_IS_BOLD, LAB_POSITION } from '@utils/constants.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface SpectralAveragingMIDFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export default function SpectralAveragingMIDField({
  disabled = false,
  required = false,
  setValue,
  suffix = null,
  value,
  widthButton = 2,
  widthLabel = 6
}: SpectralAveragingMIDFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'spectralAveraging';
  const { observatoryConstants } = useOSDAccessors();

  const getOptions = () => observatoryConstants.SpectralAveraging;

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled}
          options={getOptions()}
          testId={FIELD}
          value={value}
          setValue={setValue}
          label={t(FIELD + '.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={suffix ? widthLabel + 1 : widthLabel}
          onFocus={() => setHelp(FIELD + '.help')}
          required={required}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
