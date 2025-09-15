import { DropDown } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Grid } from '@mui/material';
import { BANDWIDTH_TELESCOPE, LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ObservingBandFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export default function ObservingBandField({
  disabled = false,
  required = false,
  setValue,
  suffix = null,
  value,
  widthButton = 2,
  widthLabel = 6
}: ObservingBandFieldProps) {
  const { t } = useScopedTranslation();
  const { helpComponent } = storageObject.useStore();
  const FIELD = 'observingBand';

  const getOptions = () => BANDWIDTH_TELESCOPE;

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
          onFocus={() => helpComponent(t(FIELD + '.help'))}
          required={required}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
