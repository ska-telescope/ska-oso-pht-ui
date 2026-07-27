import { DropDown } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { range } from '@mui/x-data-grid/utils/utils';
import { Grid, InputAdornment } from '@mui/material';
import { presentUnits } from '@/utils/present/present';

interface TimeAveragingFieldProps {
  disabled?: boolean;
  required?: boolean;
  onFocus?: Function;
  setValue?: Function;
  value: number;
}

const UNAVERAGED_VALUE_S = 0.84934656;

const OPTIONS = range(1, 13).map((value) => ({
  label: (value * UNAVERAGED_VALUE_S).toFixed(3),
  value
}));

export default function TimeAveragingField({
  disabled = false,
  required = false,
  onFocus,
  setValue,
  value
}: TimeAveragingFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'timeAveraging';
  const unitLabel = presentUnits(t('timeAveraging.0'));

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid size={{ xs: 11 }}>
        <DropDown
          disabled={disabled}
          disabledUnderline={disabled}
          options={OPTIONS}
          testId={FIELD}
          value={value}
          setValue={setValue}
          label={t('timeAveraging.label')}
          onFocus={onFocus}
          required={required}
        />
      </Grid>
      <Grid
        size={{ xs: 1 }}
        sx={{
          display: 'flex',
          alignItems: 'flex-end'
        }}
      >
        <InputAdornment position="end">{unitLabel}</InputAdornment>
      </Grid>
    </Grid>
  );
}
