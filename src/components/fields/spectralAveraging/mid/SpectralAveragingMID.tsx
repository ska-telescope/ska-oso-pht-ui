import { DropDown } from '@ska-telescope/ska-gui-components';
import { Grid } from '@mui/material';
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
}

export default function SpectralAveragingMIDField({
  disabled = false,
  required = false,
  setValue,
  suffix = null,
  value,
  widthButton = 2
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
          onFocus={() => setHelp(FIELD + '.help')}
          required={required}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
