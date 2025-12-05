import { Box, Grid } from '@mui/system';
import {
  POLARISATIONS,
  POLARISATIONS_PST_BANK,
  POLARISATIONS_PST_FLOW,
  TYPE_CONTINUUM
} from '@utils/constants.ts';
import { Typography } from '@mui/material';
import { LABEL_POSITION, TickBox } from '@ska-telescope/ska-gui-components';
import { useMemo } from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface PolarisationsFieldProps {
  disabled?: boolean;
  required?: boolean;
  observationType?: number;
  dataProductType?: number;
  labelWidth?: number;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  setValue?: (value: string[]) => void;
  value: string[];
  displayOnly?: boolean;
}

export default function PolarisationsField({
  disabled = false,
  required = false,
  observationType = TYPE_CONTINUUM,
  dataProductType = 1,
  labelWidth = 5,
  onFocus,
  setValue,
  value,
  displayOnly = false
}: PolarisationsFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'polarisations';

  const options = useMemo(() => {
    const base =
      observationType === TYPE_CONTINUUM
        ? POLARISATIONS
        : dataProductType === 1
        ? POLARISATIONS_PST_FLOW
        : POLARISATIONS_PST_BANK;

    return base.map(el => ({
      label: t(`${FIELD}.${el.value}`),
      value: el.value
    }));
  }, [observationType, dataProductType, t]);

  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked ? [...value, optionValue] : value.filter(v => v !== optionValue);
    setValue?.(newValue);
  };

  const displayString = options
    .filter(opt => value.includes(opt.value))
    .map(opt => opt.label)
    .join(', ');

  return (
    <Box pl={1} pt={2}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Label Section */}
        {labelWidth > 0 && (
          <Grid size={{ md: labelWidth }}>
            <Typography
              variant="subtitle1"
              fontWeight="normal"
              sx={{ mb: 1 }}
              color={disabled ? 'text.disabled' : 'text.primary'}
            >
              {t(`${FIELD}.label`)}
              {required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
          </Grid>
        )}

        {/* Value Section */}
        <Grid size={{ md: 12 - labelWidth }}>
          {displayOnly ? (
            <Typography pt={1} variant="body2" color="text.secondary">
              {displayString || t(`${FIELD}.noneSelected`)}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {options.map(option => (
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
