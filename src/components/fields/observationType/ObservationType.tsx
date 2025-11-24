import { DropDown } from '@ska-telescope/ska-gui-components';
import { Grid } from '@mui/material';
import {
  LAB_IS_BOLD,
  LAB_POSITION,
  OBSERVATION_TYPE,
  TYPE_CONTINUUM
} from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface ObservationTypeFieldProps {
  isContinuumOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export default function ObservationTypeField({
  isContinuumOnly = false,
  disabled = false,
  required = false,
  setValue,
  suffix = null,
  value,
  widthButton = 2,
  widthLabel = 6
}: ObservationTypeFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'observationType';

  const options = (prefix: string, arr: number[]) => {
    let results: { label: string; value: number }[] = [];
    arr.forEach(element => {
      results.push({ label: t(prefix + '.' + element), value: element });
    });
    return results;
  };

  const getOptions = (isContinuumOnly: boolean) =>
    options(
      'observationType',
      isContinuumOnly ? OBSERVATION_TYPE.filter(e => e === TYPE_CONTINUUM) : OBSERVATION_TYPE
    );

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled}
          options={getOptions(isContinuumOnly)}
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
