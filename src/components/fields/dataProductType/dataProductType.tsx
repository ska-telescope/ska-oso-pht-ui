import { Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface DataProductTypeFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
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
  suffix = null,
  value,
  widthButton = 0,
  labelWidth = 5
}: DataProductTypeFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'dataProductType';
  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled}
          options={[1, 2]}
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
