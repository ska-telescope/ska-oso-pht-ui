import { Box, Grid } from '@mui/system';
import { TYPE_CONTINUUM, TYPE_PST } from '@utils/constants.ts';
import { Typography } from '@mui/material';
import { LABEL_POSITION, TickBox } from '@ska-telescope/ska-gui-components';
import { useMemo } from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface PolarisationsFieldProps {
  disabled?: boolean;
  required?: boolean;
  observationType?: string;
  dataProductType?: number;
  labelWidth?: number;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  setError?: (error: string) => void;
  setValue?: (value: string[]) => void;
  value: string[];
  displayOnly?: boolean;
}

const POLARISATIONS = [
  { value: 'I' },
  { value: 'Q' },
  { value: 'U' },
  { value: 'V' },
  { value: 'XX' },
  { value: 'XY' },
  { value: 'YX' },
  { value: 'YY' }
];
const POLARISATIONS_PST_FLOW = [{ value: 'X' }, { value: 'Y' }];
const POLARISATIONS_PST_BANK = [{ value: 'I' }, { value: 'Q' }, { value: 'U' }, { value: 'V' }];

export default function PolarisationsField({
  disabled = false,
  required = false,
  observationType = TYPE_CONTINUUM,
  dataProductType = 1,
  labelWidth = 5,
  onFocus,
  setError,
  setValue,
  value,
  displayOnly = false
}: PolarisationsFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'polarisations';

  const options = useMemo(() => {
    const base =
      observationType === TYPE_PST
        ? dataProductType === 1
          ? POLARISATIONS_PST_BANK
          : POLARISATIONS_PST_FLOW
        : POLARISATIONS;

    return base.map((el) => ({
      label: t(`${FIELD}.${el.value}`),
      value: el.value
    }));
  }, [observationType, dataProductType, t]);

  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked ? [...value, optionValue] : value.filter((v) => v !== optionValue);
    setValue?.(newValue);
    setError?.(newValue.length > 0 ? '' : t(`${FIELD}.error`));
  };

  const displayString = options
    ?.filter((opt) => value?.includes(opt?.value))
    ?.map((opt) => opt?.label)
    ?.join(', ');

  return (
    <Box
      sx={{
        pl: 1,
        pt: 2
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          alignItems: 'flex-start'
        }}
      >
        {labelWidth > 0 && (
          <Grid size={{ md: labelWidth }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'normal',
                color: disabled ? 'text.disabled' : 'text.primary',
                mb: 1
              }}
            >
              {t(`${FIELD}.label`)}
              {required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
          </Grid>
        )}

        <Grid size={{ md: 12 - labelWidth }}>
          {displayOnly ? (
            <Typography
              variant="body2"
              sx={{
                pt: 1,
                color: 'text.secondary'
              }}
            >
              {displayString || t(`${FIELD}.noneSelected`)}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {options.map((option) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={option.value}>
                  <TickBox
                    label={option.label}
                    labelBold
                    labelPosition={LABEL_POSITION.END}
                    labelWidth={10}
                    testId={`${FIELD}${option.value}`}
                    checked={value.includes(option.value)}
                    onChange={(e: { target: { checked: boolean } }) =>
                      handleChange(option.value, e.target.checked)
                    }
                    onFocus={onFocus}
                    disabled={disabled}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
