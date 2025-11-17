import { DropDown } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Grid } from '@mui/material';
import {
  BANDWIDTH_TELESCOPE,
  LAB_IS_BOLD,
  LAB_POSITION,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_NUM
} from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

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
  const { osdLOW } = useOSDAccessors();
  const { osdMID } = useOSDAccessors();

  const getOptions = () => {
    let filteredOptions = BANDWIDTH_TELESCOPE; // TODO we should use observatoryConstants here

    if (osdMID === null) {
      filteredOptions = filteredOptions?.filter((e: any) => e.telescope === TELESCOPE_LOW_NUM);
    }

    if (osdLOW === null) {
      filteredOptions = filteredOptions?.filter((e: any) => e.telescope === TELESCOPE_MID_NUM);
    }

    return filteredOptions;
  };

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled || getOptions().length < 2}
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
