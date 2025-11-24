import { Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import {
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  LAB_IS_BOLD,
  LAB_POSITION,
  TYPE_CONTINUUM
} from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface DataProductTypeFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
  observationType?: number;
  suffix?: any;
  value: string | number;
  widthButton?: number;
  labelWidth?: number;
}

export default function DataProductTypeField({
  disabled = false,
  onFocus = undefined,
  required = false,
  setValue = undefined,
  observationType = TYPE_CONTINUUM,
  suffix = null,
  value,
  widthButton = 0,
  labelWidth = 5
}: DataProductTypeFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'dataProductType';
  const options = () =>
    [DP_TYPE_IMAGES, DP_TYPE_VISIBLE].map(el => {
      return { label: t(FIELD + '.options.' + observationType + '.' + el), lookup: el, value: el };
    });

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled}
          options={options()}
          testId={FIELD}
          value={value}
          setValue={setValue}
          label={t(FIELD + '.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={suffix ? labelWidth + 1 : labelWidth}
          onFocus={onFocus}
          required={required}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
