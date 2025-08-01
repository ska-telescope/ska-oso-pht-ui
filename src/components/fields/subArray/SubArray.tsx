import { useTranslation } from 'react-i18next';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Grid2 } from '@mui/material';
import { BANDWIDTH_TELESCOPE, LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { subArrayOptions } from '../../../utils/observationOptions';

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
  const { t } = useTranslation('pht');
  const { helpComponent } = storageObject.useStore();
  const FIELD = 'subArrayConfiguration';

  const getOptions = () => {
    if (telescope > 0) {
      const options = subArrayOptions(BANDWIDTH_TELESCOPE[observingBand]);
      return options?.map(e => {
        return {
          label: t('subArrayConfiguration.' + e.value),
          value: e.value
        };
      });
    }
  };

  return (
    <Grid2 pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid2 pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        {getOptions() && (
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
        )}
      </Grid2>
      <Grid2 size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid2>
    </Grid2>
  );
}
