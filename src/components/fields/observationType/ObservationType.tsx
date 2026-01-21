import { DropDown } from '@ska-telescope/ska-gui-components';
import { Grid } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface ObservationTypeFieldProps {
  disabled?: boolean;
  options?: any[];
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: string;
  widthButton?: number;
}

export default function ObservationTypeField({
  disabled = false,
  options = [],
  required = false,
  setValue,
  suffix = null,
  value,
  widthButton = 2
}: ObservationTypeFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'observationType';

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled || options.length < 2}
          options={options}
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
