import { Grid } from '@mui/material';
import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useNumericInput } from '@/utils/hooks/useNumericInput';

interface RobustFieldProps {
  disabled?: boolean;
  onFocus?: () => void;
  label: string;
  required?: boolean;
  setValue?: (nextValue: number) => void;
  suffix?: React.ReactNode;
  value: string | number;
  widthButton?: number;
}

const ROBUST_RANGE = { min: -2, max: 2 };
const ROBUST_STEP = 0.1;
const FIELD = 'robust';

export default function RobustField({
  disabled = false,
  onFocus = undefined,
  label,
  required = false,
  setValue = undefined,
  suffix = null,
  value,
  widthButton = 0
}: RobustFieldProps) {
  const { t } = useScopedTranslation();
  const { localValue, errorText, handleChange, handleBlur, inputRef } = useNumericInput(
    Number(value ?? 0),
    (num) => setValue?.(num),
    {
      requiredMessage: t('robust.error'),
      validate: (num) =>
        num < ROBUST_RANGE.min || num > ROBUST_RANGE.max ? t('robust.error') : '',
      commitOnBlur: true,
      step: ROBUST_STEP,
      minValue: ROBUST_RANGE.min,
      maxValue: ROBUST_RANGE.max
    }
  );

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <NumberEntry
          disabled={disabled}
          errorText={errorText}
          inputRef={inputRef}
          label={label}
          required={required}
          testId={FIELD}
          value={localValue}
          setValue={handleChange}
          onBlur={handleBlur}
          onFocus={onFocus}
          suffix={suffix}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
