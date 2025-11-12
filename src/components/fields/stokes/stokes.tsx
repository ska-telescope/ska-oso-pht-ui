import { Box, Grid } from '@mui/system';
import { STOKES } from '@utils/constants.ts';
import { Typography } from '@mui/material';
import { LABEL_POSITION, TickBox } from '@ska-telescope/ska-gui-components';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface StokesFieldProps {
  disabled?: boolean;
  required?: boolean;
  labelWidth?: number;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  setValue?: (value: string[]) => void;
  value: string[];
}

export default function StokesField({
  disabled = false,
  required = false,
  labelWidth = 5,
  onFocus,
  setValue,
  value
}: StokesFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'stokes';

  const options = () =>
    STOKES.map(el => {
      return { label: t('stokes.' + el.value), value: el.value };
    });

  return (
    <Box pl={1} pt={2}>
      <Grid container spacing={2} alignItems="flex-start">
        {/* Label Section */}
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

        {/* Checkbox Section */}
        <Grid size={{ md: 12 - labelWidth }}>
          <Grid container spacing={2}>
            {options().map(option => (
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
