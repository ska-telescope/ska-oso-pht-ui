import { DropDown } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Grid } from '@mui/material';
import {
  BANDWIDTH_TELESCOPE,
  LAB_IS_BOLD,
  LAB_POSITION,
  OB_SUBARRAY_CUSTOM
} from '@utils/constants.ts';
import { subArrayOptions } from '@utils/observationOptions.tsx';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface SubArrayFieldProps {
  observingBand: number;
  telescope: number;
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export default function SubArrayField({
  observingBand,
  telescope,
  disabled = false,
  required = false,
  setValue,
  suffix = null,
  value,
  widthButton = 2,
  widthLabel = 6
}: SubArrayFieldProps) {
  const { t } = useScopedTranslation();
  const { helpComponent } = storageObject.useStore();
  const FIELD = 'subArrayConfiguration';
  const { observatoryConstants } = useOSDAccessors();
  const { osdIsCustomAllowed } = useOSDAccessors();

  const getOptions = () => {
    if (telescope > 0) {
      const options = subArrayOptions(BANDWIDTH_TELESCOPE[observingBand], observatoryConstants);

      const filteredOptions = !osdIsCustomAllowed
        ? options?.filter((e: any) => e.value !== OB_SUBARRAY_CUSTOM)
        : options;

      return filteredOptions?.map((e: any) => ({
        label: t(`subArrayConfiguration.${e.value}`),
        value: e.value
      }));
    }
  };

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        {getOptions() && (
          <DropDown
            disabled={disabled || getOptions()?.length < 2}
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
        )}
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
