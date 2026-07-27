import { DropDown } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { range } from '@mui/x-data-grid/utils/utils';
import { Grid, InputAdornment } from '@mui/material';
import { presentUnits } from '@/utils/present/present';

interface FrequencyAveragingFieldProps {
  disabled?: boolean;
  required?: boolean;
  onFocus?: Function;
  setValue?: (frequencyAveragingFactor: number) => void;
  value: number;
}

const UNAVERAGED_VALUE_KHZ = 781.25 / 144;

const OPTIONS = range(1, 13).map(value => ({
  label: (value * UNAVERAGED_VALUE_KHZ).toFixed(2),
  value
}));

export default function FrequencyAveragingField({
  disabled = false,
  required = false,
  onFocus,
  setValue,
  value
}: FrequencyAveragingFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'frequencyAveraging';
  const unitLabel = presentUnits(t('frequencyAveraging.0'));

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
          label={t('frequencyAveraging.label')}
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
