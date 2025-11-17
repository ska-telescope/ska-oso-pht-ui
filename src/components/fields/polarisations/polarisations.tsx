import { Box, Grid } from '@mui/system';
import {
  POLARISATIONS,
  POLARISATIONS_PST_BANK,
  POLARISATIONS_PST_FLOW,
  TYPE_CONTINUUM
} from '@utils/constants.ts';
import { Typography } from '@mui/material';
import { LABEL_POSITION, TickBox } from '@ska-telescope/ska-gui-components';
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
}

export default function PolarisationsField({
  disabled = false,
  required = false,
  observationType = TYPE_CONTINUUM,
  dataProductType = 1,
  labelWidth = 5,
  onFocus,
  setValue,
  value
}: PolarisationsFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'polarisations';

  const options = () => {
    const opts =
      observationType === TYPE_CONTINUUM
        ? POLARISATIONS
        : dataProductType === 1
        ? POLARISATIONS_PST_FLOW
        : POLARISATIONS_PST_BANK;
    return opts.map(el => {
      return { label: t('polarisations.' + el.value), value: el.value };
    });
  };

  return (
    <Box pl={1} pt={2}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Label Section */}
        {labelWidth > 0 && (
          <Grid size={{ md: labelWidth }}>
            <Typography
              variant="subtitle1"
              fontWeight={'normal'}
              sx={{ mb: 1 }}
              color={disabled ? 'text.disabled' : 'text.primary'}
            >
              {t(FIELD + '.label')}
              {required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
          </Grid>
        )}

        {/* Checkbox Section */}
        <Grid size={{ md: 12 - labelWidth }}>
          <Grid container spacing={2}>
            {options().map((option: any) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={option.value}>
                <TickBox
                  label={t(FIELD + '.' + option.value)}
                  labelBold
                  labelPosition={LABEL_POSITION.END}
                  testId={FIELD + option.value}
                  checked={value.includes(option.value)}
                  onChange={(e: { target: { checked: any } }) => {
                    const checked = e.target.checked;
                    const newValue = checked
                      ? [...value, option.value]
                      : value.filter((v: string) => v !== option.value);
                    setValue?.(newValue);
                  }}
                  onFocus={onFocus ? { onFocus } : undefined}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
